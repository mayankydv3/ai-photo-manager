from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Person, Face, Photo
from app.schemas import PersonOut, FaceOut, PhotoOut

router = APIRouter(prefix="/faces", tags=["faces"])

@router.get("/people", response_model=List[PersonOut])
def get_people(db: Session = Depends(get_db)):
    people = db.query(Person).all()
    result = []
    for p in people:
        face_count = len(p.faces) if p.faces else 0
        cover_url = f"/api/v1/photos/{p.cover_photo_id}/file" if p.cover_photo_id else None
        result.append({
            "id": p.id,
            "name": p.name,
            "cover_photo_url": cover_url,
            "face_count": face_count,
            "created_at": p.created_at
        })
    return result

@router.get("/people/{person_id}/photos", response_model=List[PhotoOut])
def get_person_photos(person_id: int, db: Session = Depends(get_db)):
    person = db.query(Person).get(person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    photo_ids = [f.photo_id for f in person.faces]
    photos = db.query(Photo).filter(Photo.id.in_(photo_ids)).all() if photo_ids else []
    return [PhotoOut.from_orm(p) for p in photos]

@router.put("/people/{person_id}/name")
def update_person_name(person_id: int, name: str = Body(..., embed=True), db: Session = Depends(get_db)):
    person = db.query(Person).get(person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    person.name = name
    db.commit()
    return {"status": "updated", "id": person_id, "name": name}
