from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Photo, Person, Face, DuplicateGroup, SyncSource
from app.schemas import StatsOut

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/", response_model=StatsOut)
def get_system_stats(db: Session = Depends(get_db)):
    total_photos = db.query(Photo).count()
    
    # Calculate storage size
    total_storage = db.query(func.sum(Photo.file_size)).scalar() or 0
    
    # Duplicates calculation
    duplicate_photos = db.query(Photo).filter(Photo.is_duplicate == True).all()
    duplicate_count = len(duplicate_photos)
    duplicate_bytes = sum(d.file_size or 0 for d in duplicate_photos)

    # Faces & People
    total_faces = db.query(Face).count()
    total_people = db.query(Person).count()

    # Category breakdown
    cat_counts = db.query(Photo.category, func.count(Photo.id)).group_by(Photo.category).all()
    categories_breakdown = {c[0]: c[1] for c in cat_counts}

    # Sync sources
    sources = db.query(SyncSource).all()
    sync_status = {
        s.source_type: {
            "name": s.name_or_path,
            "status": s.status,
            "processed": s.processed_files,
            "total": s.total_files
        } for s in sources
    }

    return {
        "total_photos": total_photos,
        "total_storage_bytes": total_storage,
        "duplicate_photos_count": duplicate_count,
        "duplicate_bytes_savable": duplicate_bytes,
        "total_faces": total_faces,
        "total_people": total_people,
        "categories_breakdown": categories_breakdown,
        "sync_status": sync_status
    }
