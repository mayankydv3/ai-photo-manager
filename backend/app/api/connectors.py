from typing import Optional
from fastapi import APIRouter, Depends, Query, Body, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.scanner_service import LocalScannerService
from app.services.google_photos_service import GooglePhotosService
from app.services.dataset_generator import DatasetGenerator

router = APIRouter(prefix="/connectors", tags=["connectors"])

@router.post("/scan-local")
def scan_local_directory(
    directory_path: str = Body(..., embed=True),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    result = LocalScannerService.scan_directory(db, directory_path)
    return result

@router.get("/google/auth-url")
def get_google_auth_url():
    url = GooglePhotosService.get_auth_url()
    return {"auth_url": url}

@router.post("/google/sync")
def sync_google_photos(email: str = Query("user@gmail.com"), db: Session = Depends(get_db)):
    result = GooglePhotosService.sync_google_photos(db, account_email=email)
    return result

@router.post("/seed-dataset")
def seed_dataset(
    scale_100k: bool = Query(False),
    db: Session = Depends(get_db)
):
    result = DatasetGenerator.generate_sample_dataset(db, scale_to_100k=scale_100k)
    return result
