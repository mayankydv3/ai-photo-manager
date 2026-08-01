import os
import time
import glob
from PIL import Image
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import Photo, SyncSource, DuplicateGroup, Person, Face
from app.services.duplicate_engine import DuplicateEngine
from app.services.ai_categorizer import AICategorizer
from app.services.face_engine import FaceEngine
from app.services.search_engine import SearchEngine
from app.config import settings
from typing import Any, Dict, Optional

class LocalScannerService:
    SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

    @classmethod
    def scan_directory(cls, db: Session, target_dir: str, source_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Recursively scan local folder, parse images, calculate hashes, AI categories, faces & embeddings.
        Supports continuous batch execution for 100,000+ files.
        """
        if not os.path.exists(target_dir):
            return {"status": "error", "message": f"Directory {target_dir} does not exist"}

        sync_source = None
        if source_id:
            sync_source = db.query(SyncSource).filter(SyncSource.id == source_id).first()

        if sync_source:
            sync_source.status = "syncing"
            db.commit()

        image_paths = []
        for root, _, files in os.walk(target_dir):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in cls.SUPPORTED_EXTENSIONS:
                    image_paths.append(os.path.join(root, file))

        total_files = len(image_paths)
        if sync_source:
            sync_source.total_files = total_files
            db.commit()

        processed_count = 0
        new_photos = []

        for path in image_paths:
            # Check if file already indexed
            existing = db.query(Photo).filter(Photo.file_path == path).first()
            if existing:
                processed_count += 1
                continue

            try:
                photo_obj = cls.process_single_file(path, source="local")
                if photo_obj:
                    new_photos.append(photo_obj)
                    db.add(photo_obj)
                    db.flush() # get ID

                    # Detect faces on newly ingested photo
                    try:
                        with Image.open(path) as img:
                            faces_data = FaceEngine.detect_faces(img)
                            for fd in faces_data:
                                face = Face(
                                    photo_id=photo_obj.id,
                                    bounding_box=fd['bounding_box'],
                                    embedding=fd['embedding'],
                                    confidence=fd['confidence']
                                )
                                db.add(face)
                    except Exception:
                        pass

                processed_count += 1

                if sync_source and processed_count % 10 == 0:
                    sync_source.processed_files = processed_count
                    db.commit()

            except Exception as e:
                print(f"Error processing {path}: {e}")

        # Re-run deduplication and face clustering after scanning batch
        cls.reindex_duplicates_and_faces(db)

        if sync_source:
            sync_source.status = "completed"
            sync_source.processed_files = processed_count
            sync_source.last_synced_at = datetime.utcnow()
            db.commit()

        return {
            "status": "completed",
            "total_found": total_files,
            "newly_processed": len(new_photos),
            "total_indexed": processed_count
        }

    @classmethod
    def process_single_file(cls, file_path: str, source: str = "local", external_id: str = None) -> Optional[Photo]:
        """Process an individual file and calculate AI properties."""
        if not os.path.exists(file_path):
            return None

        stat_info = os.stat(file_path)
        file_size = stat_info.st_size
        filename = os.path.basename(file_path)

        md5 = DuplicateEngine.compute_md5(file_path)

        try:
            with Image.open(file_path) as img:
                w, h = img.size
                phash = DuplicateEngine.compute_phash(img)
                ocr_text = AICategorizer.extract_ocr_text(img)
                category, confidence, tags = AICategorizer.analyze_image_heuristics(
                    image=img,
                    filename=filename,
                    extracted_text=ocr_text
                )
                embedding = SearchEngine.query_to_embedding(f"{filename} {category} {' '.join(tags)} {ocr_text}")

                photo = Photo(
                    file_path=file_path,
                    original_filename=filename,
                    file_size=file_size,
                    width=w,
                    height=h,
                    mime_type=f"image/{img.format.lower() if img.format else 'jpeg'}",
                    created_at=datetime.fromtimestamp(stat_info.st_ctime),
                    taken_at=datetime.fromtimestamp(stat_info.st_mtime),
                    md5_hash=md5,
                    phash=phash,
                    embedding=embedding,
                    category=category,
                    category_confidence=confidence,
                    extracted_text=ocr_text,
                    tags=tags,
                    source=source,
                    external_id=external_id
                )
                return photo
        except Exception as e:
            print(f"Image read error for {file_path}: {e}")
            return None

    @classmethod
    def reindex_duplicates_and_faces(cls, db: Session):
        """Run batch deduplication and face clustering on all database photos."""
        photos = db.query(Photo).all()
        photos_data = [
            {
                "id": p.id,
                "md5_hash": p.md5_hash,
                "phash": p.phash,
                "embedding": p.embedding,
                "file_size": p.file_size
            }
            for p in photos
        ]

        # Reset duplicate status first
        db.query(Photo).update({"is_duplicate": False, "duplicate_group_id": None, "duplicate_type": None})
        db.query(DuplicateGroup).delete()
        db.commit()

        exact_groups, near_groups = DuplicateEngine.find_duplicates(photos_data)

        # Record Exact Duplicates
        for group in exact_groups:
            primary_id = group['primary']['id']
            dg = DuplicateGroup(
                primary_photo_id=primary_id,
                duplicate_type="exact",
                similarity_score=1.0
            )
            db.add(dg)
            db.flush()

            for dup in group['duplicates']:
                p_item = db.query(Photo).get(dup['id'])
                if p_item:
                    p_item.is_duplicate = True
                    p_item.duplicate_group_id = dg.id
                    p_item.duplicate_type = "exact"

        # Record Near Duplicates
        for group in near_groups:
            primary_id = group['primary']['id']
            dg = DuplicateGroup(
                primary_photo_id=primary_id,
                duplicate_type="near",
                similarity_score=group['score']
            )
            db.add(dg)
            db.flush()

            for dup in group['duplicates']:
                p_item = db.query(Photo).get(dup['id'])
                if p_item:
                    p_item.is_duplicate = True
                    p_item.duplicate_group_id = dg.id
                    p_item.duplicate_type = "near"

        db.commit()

        # Face Clustering into People
        faces = db.query(Face).all()
        faces_data = [{"id": f.id, "photo_id": f.photo_id, "embedding": f.embedding} for f in faces]
        clusters = FaceEngine.cluster_faces(faces_data)

        for cluster_id, c_faces in clusters.items():
            # Find or create person
            person_name = f"Person #{abs(cluster_id)}"
            person = db.query(Person).filter(Person.name == person_name).first()
            if not person:
                cover_id = c_faces[0]["photo_id"] if c_faces else None
                person = Person(name=person_name, cover_photo_id=cover_id)
                db.add(person)
                db.flush()

            for f_dict in c_faces:
                f_obj = db.query(Face).get(f_dict["id"])
                if f_obj:
                    f_obj.person_id = person.id

        db.commit()
