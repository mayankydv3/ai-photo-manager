from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class PhotoBase(BaseModel):
    original_filename: str
    file_path: str
    file_size: int
    width: int = 0
    height: int = 0
    mime_type: str = "image/jpeg"
    category: str = "other"
    category_confidence: float = 1.0
    extracted_text: Optional[str] = None
    tags: List[str] = []
    source: str = "local"

class PhotoCreate(PhotoBase):
    md5_hash: str
    phash: str
    embedding: Optional[List[float]] = None

class PhotoOut(PhotoBase):
    id: int
    created_at: datetime
    taken_at: datetime
    md5_hash: Optional[str] = None
    phash: Optional[str] = None
    is_duplicate: bool = False
    duplicate_group_id: Optional[int] = None
    duplicate_type: Optional[str] = None
    thumbnail_path: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    faces_count: int = 0

    class Config:
        from_attributes = True

class PersonOut(BaseModel):
    id: int
    name: str
    cover_photo_url: Optional[str] = None
    face_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class FaceOut(BaseModel):
    id: int
    photo_id: int
    person_id: Optional[int] = None
    bounding_box: Dict[str, Any]
    confidence: float

    class Config:
        from_attributes = True

class DuplicateGroupOut(BaseModel):
    id: int
    primary_photo: PhotoOut
    duplicates: List[PhotoOut]
    duplicate_type: str
    similarity_score: float

    class Config:
        from_attributes = True

class SearchQuery(BaseModel):
    query: str
    category: Optional[str] = None
    person_id: Optional[int] = None
    is_duplicate: Optional[bool] = None
    source: Optional[str] = None
    limit: int = 50
    offset: int = 0

class StatsOut(BaseModel):
    total_photos: int
    total_storage_bytes: int
    duplicate_photos_count: int
    duplicate_bytes_savable: int
    total_faces: int
    total_people: int
    categories_breakdown: Dict[str, int]
    sync_status: Dict[str, Any]
