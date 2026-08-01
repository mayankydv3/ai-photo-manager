from app.services.face_engine import FaceEngine

def test_face_clustering():
    # Two distinct face feature clusters
    faces = [
        {"id": 1, "photo_id": 10, "embedding": [0.1] * 128},
        {"id": 2, "photo_id": 11, "embedding": [0.11] * 128}, # Person A
        {"id": 3, "photo_id": 12, "embedding": [0.9] * 128},
        {"id": 4, "photo_id": 13, "embedding": [0.89] * 128}  # Person B
    ]

    clusters = FaceEngine.cluster_faces(faces)
    assert len(clusters) >= 2
