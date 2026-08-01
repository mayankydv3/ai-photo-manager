from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String, unique=True, index=True, nullable=False)
    original_filename = Column(String, index=True)
    file_size = Column(Integer, index=True)
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    mime_type = Column(String, default="image/jpeg")
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    taken_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Hashes & Embeddings
    md5_hash = Column(String(32), index=True)
    phash = Column(String(64), index=True)
    embedding = Column(JSON, nullable=True) # Multimodal CLIP float vector
    
    # Classification & Content Analysis
    category = Column(String, index=True, default="other") # documents, prescriptions, receipts, people, travel, pets, other
    category_confidence = Column(Float, default=1.0)
    extracted_text = Column(Text, nullable=True) # OCR content for receipts, prescriptions, docs
    tags = Column(JSON, default=list) # e.g. ["beach", "sunset", "dog"]
    
    # Duplication
    is_duplicate = Column(Boolean, default=False, index=True)
    duplicate_group_id = Column(Integer, ForeignKey("duplicate_groups.id"), nullable=True)
    duplicate_type = Column(String, nullable=True) # "exact", "near"
    
    # Metadata & Source
    source = Column(String, default="local", index=True) # "local", "google_photos"
    external_id = Column(String, nullable=True, index=True) # Google Photos ID
    thumbnail_path = Column(String, nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)

    faces = relationship("Face", back_populates="photo", cascade="all, delete-orphan")
    duplicate_group = relationship("DuplicateGroup", foreign_keys=[duplicate_group_id])

class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Unknown Person", index=True)
    cover_photo_id = Column(Integer, ForeignKey("photos.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    faces = relationship("Face", back_populates="person")

class Face(Base):
    __tablename__ = "faces"

    id = Column(Integer, primary_key=True, index=True)
    photo_id = Column(Integer, ForeignKey("photos.id"), nullable=False)
    person_id = Column(Integer, ForeignKey("people.id"), nullable=True)
    bounding_box = Column(JSON, nullable=False) # {x, y, width, height}
    embedding = Column(JSON, nullable=False) # 128-d or 512-d float list
    confidence = Column(Float, default=0.95)

    photo = relationship("Photo", back_populates="faces")
    person = relationship("Person", back_populates="faces")

class DuplicateGroup(Base):
    __tablename__ = "duplicate_groups"

    id = Column(Integer, primary_key=True, index=True)
    primary_photo_id = Column(Integer, ForeignKey("photos.id"), nullable=False)
    duplicate_type = Column(String, default="exact") # "exact" or "near"
    similarity_score = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class SyncSource(Base):
    __tablename__ = "sync_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String, nullable=False) # "local" or "google_photos"
    name_or_path = Column(String, nullable=False)
    status = Column(String, default="idle") # "idle", "syncing", "completed", "error"
    total_files = Column(Integer, default=0)
    processed_files = Column(Integer, default=0)
    last_synced_at = Column(DateTime, nullable=True)
