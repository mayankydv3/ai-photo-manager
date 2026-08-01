import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base, SessionLocal
from app.config import settings
from app.api import photos, duplicates, categories, faces, search, connectors, stats
from app.services.dataset_generator import DatasetGenerator

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered photo management platform with Google Photos sync, near-duplicate detection, zero-shot categorization, face recognition, and natural language search.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(photos.router, prefix=settings.API_V1_STR)
app.include_router(duplicates.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(faces.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)
app.include_router(connectors.router, prefix=settings.API_V1_STR)
app.include_router(stats.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    """Auto-seed sample photos on initial application startup if database is fresh."""
    db = SessionLocal()
    try:
        from app.models import Photo
        count = db.query(Photo).count()
        if count == 0:
            print("Database empty. Generating initial sample dataset...")
            DatasetGenerator.generate_sample_dataset(db)
    except Exception as e:
        print(f"Startup initialization note: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "health": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
