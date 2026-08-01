import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from PIL import Image
import io

from app.database import get_db
from app.models import Photo, DuplicateGroup, Face, Person
from app.schemas import PhotoOut, PhotoCreate
from app.services.scanner_service import LocalScannerService
from app.config import settings

router = APIRouter(prefix="/photos", tags=["photos"])

@router.get("/", response_model=List[PhotoOut])
def list_photos(
    category: Optional[str] = Query(None),
    is_duplicate: Optional[bool] = Query(None),
    source: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Photo)
    if category and category != "all":
        query = query.filter(Photo.category == category)
    if is_duplicate is not None:
        query = query.filter(Photo.is_duplicate == is_duplicate)
    if source and source != "all":
        query = query.filter(Photo.source == source)

    photos = query.order_by(Photo.created_at.desc()).offset(skip).limit(limit).all()
    
    # Calculate faces count for output schema
    result = []
    for p in photos:
        p_dict = PhotoOut.from_orm(p)
        p_dict.faces_count = len(p.faces) if p.faces else 0
        result.append(p_dict)
    return result

@router.get("/{photo_id}", response_model=PhotoOut)
def get_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    p_dict = PhotoOut.from_orm(photo)
    p_dict.faces_count = len(photo.faces) if photo.faces else 0
    return p_dict

@router.get("/{photo_id}/file")
def get_photo_file(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    if photo.file_path and os.path.exists(photo.file_path):
        return FileResponse(photo.file_path, media_type=photo.mime_type or "image/jpeg")
    
    # Return placeholder image if virtual scaled photo
    img = Image.new("RGB", (600, 400), color=(50, 80, 120))
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    draw.text((40, 180), f"SmartPhoto AI\nPhoto #{photo.id}\nCategory: {photo.category}\n{photo.original_filename}", fill=(255, 255, 255))
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return Response(content=buf.getvalue(), media_type="image/jpeg")

@router.post("/upload", response_model=PhotoOut)
async def upload_photo(file: UploadFile = File(...), db: Session = Depends(get_db)):
    target_path = os.path.join(settings.DATA_DIR, file.filename)
    with open(target_path, "wb") as f:
        content = await file.read()
        f.write(content)

    photo = LocalScannerService.process_single_file(target_path, source="upload")
    if not photo:
        raise HTTPException(status_code=400, detail="Failed to process image file")

    db.add(photo)
    db.commit()
    db.refresh(photo)

    # Reindex duplicate groups & faces
    LocalScannerService.reindex_duplicates_and_faces(db)

    p_dict = PhotoOut.from_orm(photo)
    p_dict.faces_count = len(photo.faces) if photo.faces else 0
    return p_dict

@router.delete("/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    if photo.file_path and os.path.exists(photo.file_path):
        try:
            os.remove(photo.file_path)
        except Exception:
            pass

    db.delete(photo)
    db.commit()
    return {"status": "deleted", "id": photo_id}

@router.post("/bulk-delete-duplicates")
def bulk_delete_duplicates(db: Session = Depends(get_db)):
    duplicates = db.query(Photo).filter(Photo.is_duplicate == True).all()
    deleted_count = 0
    freed_bytes = 0

    for dup in duplicates:
        freed_bytes += dup.file_size or 0
        if dup.file_path and os.path.exists(dup.file_path):
            try:
                os.remove(dup.file_path)
            except Exception:
                pass
        db.delete(dup)
        deleted_count += 1

    db.query(DuplicateGroup).delete()
    db.commit()

    return {
        "status": "success",
        "deleted_count": deleted_count,
        "freed_bytes": freed_bytes,
        "freed_mb": round(freed_bytes / (1024 * 1024), 2)
    }
