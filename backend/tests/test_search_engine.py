from app.services.search_engine import SearchEngine

def test_natural_language_search():
    photos = [
        {"id": 1, "original_filename": "beach_vacation.jpg", "category": "travel", "tags": ["beach", "sunset"], "extracted_text": ""},
        {"id": 2, "original_filename": "cvs_prescription.jpg", "category": "prescriptions", "tags": ["rx"], "extracted_text": "Doctor Smith Rx Tablet"},
        {"id": 3, "original_filename": "dog_park.jpg", "category": "pets", "tags": ["dog", "puppy"], "extracted_text": ""}
    ]

    results_travel = SearchEngine.search(photos, query="beach sunset vacation")
    assert len(results_travel) >= 1
    assert results_travel[0]["id"] == 1

    results_rx = SearchEngine.search(photos, query="doctor prescription medicine")
    assert len(results_rx) >= 1
    assert results_rx[0]["id"] == 2
