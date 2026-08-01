import os
import random
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Photo, SyncSource
from app.services.scanner_service import LocalScannerService
from app.config import settings

class GooglePhotosService:
    @classmethod
    def get_auth_url(cls) -> str:
        """Returns OAuth authorization URL for Google Photos API integration."""
        client_id = "SMARTPHOTO_GOOGLE_CLIENT_ID"
        redirect_uri = "http://localhost:8000/api/v1/connectors/google/callback"
        scope = "https://www.googleapis.com/auth/photoslibrary.readonly"
        return f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}"

    @classmethod
    def sync_google_photos(cls, db: Session, account_email: str = "user@gmail.com") -> Dict[str, Any]:
        """
        Simulate Google Photos REST API `/v1/mediaItems` sync with realistic cloud metadata.
        Downloads / links photos to local storage and indexes them.
        """
        source = db.query(SyncSource).filter(SyncSource.source_type == "google_photos").first()
        if not source:
            source = SyncSource(
                source_type="google_photos",
                name_or_path=account_email,
                status="syncing",
                total_files=25,
                processed_files=0
            )
            db.add(source)
            db.commit()
            db.refresh(source)
        else:
            source.status = "syncing"
            db.commit()

        # Simulated remote photo sync items
        mock_google_items = [
            {"filename": "gphotos_prescription_cvs.jpg", "category": "prescriptions", "text": "CVS Pharmacy Rx #948201 Take 1 tablet daily Dr. Smith"},
            {"filename": "gphotos_receipt_target.jpg", "category": "receipts", "text": "Target Store #1042 Total: $48.50 Visa ending in 4210"},
            {"filename": "gphotos_passport_scan.jpg", "category": "documents", "text": "Passport Official Identification Document United States"},
            {"filename": "gphotos_beach_sunset.jpg", "category": "travel", "text": "Sunset beach vacation tropical palm trees ocean"},
            {"filename": "gphotos_golden_retriever.jpg", "category": "pets", "text": "Golden retriever puppy playing in green grass park"},
            {"filename": "gphotos_family_portrait.jpg", "category": "people", "text": "Family portrait smiling happy people group photo"}
        ]

        synced_count = 0
        gphotos_dir = os.path.join(settings.DATA_DIR, "google_photos_sync")
        os.makedirs(gphotos_dir, exist_ok=True)

        for i, item in enumerate(mock_google_items):
            ext_id = f"gphoto_id_{i+100}"
            file_path = os.path.join(gphotos_dir, item["filename"])

            # Generate synthetic image if not exists
            if not os.path.exists(file_path):
                from PIL import Image, ImageDraw
                img = Image.new("RGB", (800, 600), color=(random.randint(50, 220), random.randint(50, 220), random.randint(50, 220)))
                draw = ImageDraw.Draw(img)
                draw.text((40, 40), f"Google Photos Sync\n{item['filename']}\nCategory: {item['category']}", fill=(255, 255, 255))
                img.save(file_path)

            photo = LocalScannerService.process_single_file(file_path, source="google_photos", external_id=ext_id)
            if photo:
                photo.category = item["category"]
                photo.extracted_text = item["text"]
                db.add(photo)
                synced_count += 1

        source.status = "completed"
        source.processed_files = synced_count
        source.total_files = synced_count
        source.last_synced_at = datetime.utcnow()
        db.commit()

        # Re-index duplicates & faces
        LocalScannerService.reindex_duplicates_and_faces(db)

        return {
            "status": "completed",
            "account": account_email,
            "synced_photos": synced_count
        }
