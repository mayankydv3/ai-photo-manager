from typing import List, Dict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Photo
from app.schemas import PhotoOut

router = APIRouter(prefix="/categories", tags=["categories"])

CATEGORIES_LIST = [
    {"id": "documents", "name": "Documents & Contracts", "icon": "file-text", "color": "blue"},
    {"id": "prescriptions", "name": "Prescriptions & Medical", "icon": "pill", "color": "emerald"},
    {"id": "receipts", "name": "Receipts & Bills", "icon": "receipt", "color": "amber"},
    {"id": "people", "name": "People & Portraits", "icon": "users", "color": "purple"},
    {"id": "travel", "name": "Travel & Places", "icon": "plane", "color": "cyan"},
    {"id": "pets", "name": "Pets & Animals", "icon": "dog", "color": "rose"},
    {"id": "other", "name": "Other Photos", "icon": "image", "color": "gray"}
]

@router.get("/")
def get_categories_overview(db: Session = Depends(get_db)):
    counts = db.query(Photo.category, func.count(Photo.id)).group_by(Photo.category).all()
    count_map = {c[0]: c[1] for c in counts}

    result = []
    for cat in CATEGORIES_LIST:
        cat_id = cat["id"]
        result.append({
            **cat,
            "count": count_map.get(cat_id, 0)
        })
    return result

@router.get("/{category_id}", response_model=List[PhotoOut])
def get_photos_by_category(category_id: str, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    photos = db.query(Photo).filter(Photo.category == category_id).order_by(Photo.created_at.desc()).offset(skip).limit(limit).all()
    return [PhotoOut.from_orm(p) for p in photos]
