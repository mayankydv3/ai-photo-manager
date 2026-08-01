import pytest
from PIL import Image
from app.services.duplicate_engine import DuplicateEngine

def test_phash_computation():
    img1 = Image.new("RGB", (200, 200), color="red")
    img2 = Image.new("RGB", (200, 200), color="red")
    img3 = Image.new("RGB", (200, 200), color="blue")

    h1 = DuplicateEngine.compute_phash(img1)
    h2 = DuplicateEngine.compute_phash(img2)
    h3 = DuplicateEngine.compute_phash(img3)

    assert h1 == h2
    dist12 = DuplicateEngine.phash_hamming_distance(h1, h2)
    assert dist12 == 0

    dist13 = DuplicateEngine.phash_hamming_distance(h1, h3)
    assert dist13 >= 0

def test_cosine_similarity():
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    v3 = [0.0, 1.0, 0.0]

    sim12 = DuplicateEngine.cosine_similarity(v1, v2)
    sim13 = DuplicateEngine.cosine_similarity(v1, v3)

    assert sim12 == pytest.approx(1.0)
    assert sim13 == pytest.approx(0.0)

def test_find_duplicates_grouping():
    photos = [
        {"id": 1, "md5_hash": "abc12345", "phash": "1111222233334444", "embedding": [1.0, 0.5]},
        {"id": 2, "md5_hash": "abc12345", "phash": "1111222233334444", "embedding": [1.0, 0.5]}, # Exact dup of 1
        {"id": 3, "md5_hash": "xyz98765", "phash": "1111222233334445", "embedding": [0.99, 0.51]} # Near dup of 1
    ]

    exact_groups, near_groups = DuplicateEngine.find_duplicates(photos)
    assert len(exact_groups) == 1
    assert exact_groups[0]['primary']['id'] == 1
    assert len(exact_groups[0]['duplicates']) == 1
    assert exact_groups[0]['duplicates'][0]['id'] == 2
