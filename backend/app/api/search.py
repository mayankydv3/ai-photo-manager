from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Photo
from app.schemas import SearchQuery, PhotoOut
from app.services.search_engine import SearchEngine

router = APIRouter(prefix="/search", tags=["search"])

@router.post("/", response_model=List[PhotoOut])
def search_photos(payload: SearchQuery, db: Session = Depends(get_db)):
    all_photos = db.query(Photo).all()
    
    photos_data = []
    for p in all_photos:
        photos_data.append({
            "id": p.id,
            "original_filename": p.original_filename,
            "file_path": p.file_path,
            "file_size": p.file_size,
            "width": p.width,
            "height": p.height,
            "mime_type": p.mime_type,
            "category": p.category,
            "category_confidence": p.category_confidence,
            "extracted_text": p.extracted_text,
            "tags": p.tags or [],
            "source": p.source,
            "embedding": p.embedding,
            "created_at": str(p.created_at),
            "taken_at": str(p.taken_at),
            "is_duplicate": p.is_duplicate,
            "duplicate_group_id": p.duplicate_group_id,
            "duplicate_type": p.duplicate_type,
            "md5_hash": p.md5_hash,
            "phash": p.phash,
            "faces": [{"person_id": f.person_id} for f in p.faces]
        })

    matched = SearchEngine.search(
        photos=photos_data,
        query=payload.query,
        category=payload.category,
        person_id=payload.person_id,
        is_duplicate=payload.is_duplicate,
        source=payload.source
    )

    sliced = matched[payload.offset : payload.offset + payload.limit]
    
    results = []
    for m in sliced:
        p_obj = db.query(Photo).get(m["id"])
        if p_obj:
            p_out = PhotoOut.from_orm(p_obj)
            results.append(p_out)

    return results
