import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "SmartPhoto AI"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./smartphoto.db"
    
    # AI Engine Configs
    NEAR_DUPLICATE_PHASH_THRESHOLD: int = 10 # Hamming distance threshold for pHash (0-64)
    SIMILARITY_COSINE_THRESHOLD: float = 0.85 # Cosine similarity threshold for CLIP vector near-duplicates
    FACE_DBSCAN_EPS: float = 0.45
    FACE_DBSCAN_MIN_SAMPLES: int = 2
    
    # Uploads / Media Storage
    DATA_DIR: str = os.path.abspath("./storage")
    THUMBNAIL_DIR: str = os.path.abspath("./storage/thumbnails")
    
    class Config:
        case_sensitive = True

settings = Settings()
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.THUMBNAIL_DIR, exist_ok=True)
