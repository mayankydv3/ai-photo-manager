from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Photo, DuplicateGroup
from app.schemas import DuplicateGroupOut, PhotoOut

router = APIRouter(prefix="/duplicates", tags=["duplicates"])

@router.get("/groups")
def get_duplicate_groups(db: Session = Depends(get_db)):
    groups = db.query(DuplicateGroup).all()
    result = []
    
    for g in groups:
        primary = db.query(Photo).get(g.primary_photo_id)
        duplicates = db.query(Photo).filter(Photo.duplicate_group_id == g.id).all()
        if primary and duplicates:
            result.append({
                "id": g.id,
                "primary_photo": PhotoOut.from_orm(primary),
                "duplicates": [PhotoOut.from_orm(d) for d in duplicates],
                "duplicate_type": g.duplicate_type,
                "similarity_score": g.similarity_score
            })
    return result

@router.post("/resolve/{group_id}")
def resolve_duplicate_group(group_id: int, keep_photo_id: int = Query(...), db: Session = Depends(get_db)):
    group = db.query(DuplicateGroup).get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Duplicate group not found")

    duplicates = db.query(Photo).filter(Photo.duplicate_group_id == group_id).all()
    primary = db.query(Photo).get(group.primary_photo_id)

    all_in_group = [primary] + duplicates if primary else duplicates

    for photo in all_in_group:
        if photo and photo.id != keep_photo_id:
            photo.is_duplicate = False
            photo.duplicate_group_id = None
            photo.duplicate_type = None
            # Option to soft-unlink or keep as normal photo
        elif photo:
            photo.is_duplicate = False
            photo.duplicate_group_id = None
            photo.duplicate_type = None

    db.delete(group)
    db.commit()

    return {"status": "resolved", "kept_photo_id": keep_photo_id}
