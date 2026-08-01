import os
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models import Photo, Person, Face, DuplicateGroup, SyncSource
from app.services.scanner_service import LocalScannerService
from app.config import settings

class DatasetGenerator:
    SAMPLE_DIR = os.path.abspath("./storage/sample_photos")

    @classmethod
    def generate_sample_dataset(cls, db: Session, target_count: int = 50, scale_to_100k: bool = False) -> Dict[str, Any]:
        """
        Generate realistic sample photo files for all categories, exact duplicates, near duplicates, and faces.
        If scale_to_100k is True, populates memory/SQLite index with 100,000 virtual indexed entries!
        """
        os.makedirs(cls.SAMPLE_DIR, exist_ok=True)
        created_files = []

        categories_spec = [
            # Category, filename, count, is_doc, ocr_text
            ("prescriptions", "prescription_cvs_health.jpg", 3, False, "CVS Pharmacy Rx #489201 Dr. Alan Smith Take 1 Capsule daily Medication: Amoxicillin 500mg"),
            ("prescriptions", "prescription_walgreens_rx.jpg", 2, False, "Walgreens Pharmacy Doctor Prescription Patient: John Doe Refill: 2 Times"),
            ("receipts", "receipt_walmart_grocery.jpg", 3, False, "WALMART SUPERCENTER Total: $124.95 Tax: $9.50 Cash Payment Date: 2026-03-12 Thank you"),
            ("receipts", "receipt_starbucks_coffee.jpg", 2, False, "Starbucks Coffee Invoice #1029 Subtotal: $14.50 Visa Auth: 99481"),
            ("documents", "contract_agreement_2026.jpg", 4, True, "OFFICIAL SERVICES AGREEMENT Contract Terms and Conditions Signature Page License"),
            ("documents", "passport_id_verification.jpg", 3, True, "PASSPORT IDENTIFICATION DOCUMENT Department of State Certificate"),
            ("travel", "beach_sunset_hawaii.jpg", 5, False, "Tropical Hawaii beach vacation sunset ocean palm trees landscape"),
            ("travel", "mountain_hiking_alps.jpg", 4, False, "Alpine mountain peak snow hiking trail outdoor nature scenery"),
            ("pets", "golden_retriever_dog.jpg", 5, False, "Golden retriever puppy dog playing park green grass cute pet"),
            ("pets", "persian_cat_indoor.jpg", 4, False, "Cute fluffy Persian cat kitten sitting on sofa indoor pet"),
            ("people", "person_john_portrait.jpg", 5, False, "Smiling man portrait person face selfie photo"),
            ("people", "person_sarah_portrait.jpg", 5, False, "Happy woman smiling person portrait group friends photo")
        ]

        for cat, fname_base, count, is_doc, ocr_text in categories_spec:
            for idx in range(count):
                fname = f"{cat}_{idx+1}_{fname_base}"
                fpath = os.path.join(cls.SAMPLE_DIR, fname)
                if not os.path.exists(fpath):
                    cls._create_synthetic_image(fpath, cat, idx, is_doc, ocr_text)
                created_files.append(fpath)

        # Create Exact Duplicates
        exact_base = created_files[0] if created_files else ""
        if exact_base and os.path.exists(exact_base):
            dup_exact_path = os.path.join(cls.SAMPLE_DIR, "EXACT_DUP_" + os.path.basename(exact_base))
            if not os.path.exists(dup_exact_path):
                with open(exact_base, 'rb') as f_in, open(dup_exact_path, 'wb') as f_out:
                    f_out.write(f_in.read())
            created_files.append(dup_exact_path)

        # Create Near Duplicates (slight blur / watermark)
        near_base = created_files[2] if len(created_files) > 2 else ""
        if near_base and os.path.exists(near_base):
            dup_near_path = os.path.join(cls.SAMPLE_DIR, "NEAR_DUP_" + os.path.basename(near_base))
            if not os.path.exists(dup_near_path):
                with Image.open(near_base) as img:
                    edited = img.filter(ImageFilter.GaussianBlur(radius=0.8))
                    edited.save(dup_near_path)
            created_files.append(dup_near_path)

        # Scan local directory to ingest files into DB
        scan_res = LocalScannerService.scan_directory(db, cls.SAMPLE_DIR)

        # Scale to 100,000 photos in DB for scalability demo if requested
        if scale_to_100k:
            cls.scale_database_to_100k(db)

        return {
            "status": "success",
            "files_created": len(created_files),
            "scan_result": scan_res,
            "scaled_to_100k": scale_to_100k
        }

    @classmethod
    def _create_synthetic_image(cls, filepath: str, category: str, index: int, is_doc: bool, text_content: str):
        width, height = (600, 800) if is_doc else (800, 600)

        # Color palette per category
        color_map = {
            "prescriptions": (245, 248, 250),
            "receipts": (255, 253, 240),
            "documents": (250, 250, 250),
            "travel": (70, 160, 220),
            "pets": (220, 170, 120),
            "people": (230, 190, 170)
        }
        bg_color = color_map.get(category, (200, 200, 200))
        img = Image.new("RGB", (width, height), color=bg_color)
        draw = ImageDraw.Draw(img)

        # Draw visual elements
        if is_doc or category in ["prescriptions", "receipts"]:
            # Header bar & paper border
            draw.rectangle([20, 20, width-20, height-20], outline=(180, 180, 180), width=2)
            draw.rectangle([30, 30, width-30, 90], fill=(40, 90, 150))
            draw.text((40, 45), f"{category.upper()} - DOCUMENT #{index+1}", fill=(255, 255, 255))
            
            # Text body lines
            y_pos = 120
            lines = text_content.split()
            chunk_size = 5
            for i in range(0, len(lines), chunk_size):
                line_str = " ".join(lines[i:i+chunk_size])
                draw.text((40, y_pos), line_str, fill=(30, 30, 30))
                y_pos += 35
                if y_pos > height - 60:
                    break
        else:
            # Draw photo scene
            draw.rectangle([50, 50, width-50, height-50], fill=(bg_color[0]+20, bg_color[1]+20, bg_color[2]+20))
            draw.ellipse([width//3, height//4, 2*width//3, 3*height//4], fill=(255, 210, 180)) # face/subject
            draw.text((width//3 + 20, height//2), f"{category.upper()}\n{text_content[:25]}...", fill=(40, 40, 40))

        img.save(filepath, quality=90)

    @classmethod
    def scale_database_to_100k(cls, db: Session):
        """Ultra-fast bulk insert to simulate 100,000 indexed items in SQLite database."""
        current_count = db.query(Photo).count()
        if current_count >= 100000:
            return

        needed = 100000 - current_count
        batch_size = 10000
        now = datetime.utcnow()
        cats = ["documents", "prescriptions", "receipts", "people", "travel", "pets", "other"]

        for b in range(0, needed, batch_size):
            bulk_photos = []
            cur_batch_size = min(batch_size, needed - b)
            for i in range(cur_batch_size):
                idx = current_count + b + i + 1
                cat = cats[idx % len(cats)]
                p = Photo(
                    file_path=f"/virtual/storage/photos/photo_100k_{idx}.jpg",
                    original_filename=f"photo_100k_{idx}.jpg",
                    file_size=1024 * (100 + (idx % 4000)),
                    width=1920,
                    height=1080,
                    mime_type="image/jpeg",
                    created_at=now - timedelta(minutes=idx),
                    taken_at=now - timedelta(minutes=idx),
                    md5_hash=f"md5_{idx:08d}a1b2c3d4e5f6g7h8",
                    phash=f"phash_{idx:08d}12345678",
                    embedding=[float((idx + j) % 100) / 100.0 for j in range(128)],
                    category=cat,
                    category_confidence=0.92,
                    extracted_text=f"Sample text document photo #{idx} {cat}",
                    tags=[cat, "scaled_dataset", "100k"],
                    source="local",
                    is_duplicate=(idx % 15 == 0),
                    duplicate_type="exact" if (idx % 15 == 0) else None
                )
                bulk_photos.append(p)

            db.bulk_save_objects(bulk_photos)
            db.commit()
            print(f"Bulk inserted batch: {b + cur_batch_size} / {needed} photos (Total: {current_count + b + cur_batch_size})")
