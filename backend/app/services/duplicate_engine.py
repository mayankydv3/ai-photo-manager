import hashlib
import numpy as np
from PIL import Image
import imagehash
from typing import List, Dict, Tuple, Optional
from app.config import settings

class DuplicateEngine:
    @staticmethod
    def compute_md5(file_path: str) -> str:
        """Compute exact MD5 hash of a file."""
        hasher = hashlib.md5()
        try:
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(65536), b""):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except Exception:
            return ""

    @staticmethod
    def compute_phash(img: Image.Image) -> str:
        """Compute 64-bit Perceptual Hash (pHash) of an image."""
        try:
            # Resize image and convert to grayscale for robust pHash calculation
            phash_val = imagehash.phash(img)
            return str(phash_val)
        except Exception:
            return "0" * 16

    @staticmethod
    def phash_hamming_distance(hash1: str, hash2: str) -> int:
        """Compute Hamming distance between two pHash hex strings."""
        try:
            h1 = imagehash.hex_to_hash(hash1)
            h2 = imagehash.hex_to_hash(hash2)
            return h1 - h2
        except Exception:
            return 999

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Compute cosine similarity between two feature vectors."""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        v1 = np.array(vec1, dtype=np.float32)
        v2 = np.array(vec2, dtype=np.float32)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(np.dot(v1, v2) / (norm1 * norm2))

    @classmethod
    def find_duplicates(cls, photos: List[Dict]) -> Tuple[List[Dict], List[Dict]]:
        """
        Group exact duplicates (identical MD5) and near-duplicates (pHash Hamming distance <= threshold or high vector cosine similarity).
        Input photos: list of dicts with keys ['id', 'md5_hash', 'phash', 'embedding', 'file_size']
        Returns: (exact_groups, near_groups)
        """
        exact_groups = []
        near_groups = []

        # 1. Exact Duplicates by MD5 Hash
        md5_map = {}
        for p in photos:
            md5 = p.get('md5_hash')
            if md5:
                md5_map.setdefault(md5, []).append(p)

        visited_ids = set()
        for md5, group in md5_map.items():
            if len(group) > 1:
                # Primary is the first one or largest file
                primary = group[0]
                duplicates = group[1:]
                for item in group:
                    visited_ids.add(item['id'])
                exact_groups.append({
                    'primary': primary,
                    'duplicates': duplicates,
                    'type': 'exact',
                    'score': 1.0
                })

        # 2. Near Duplicates by pHash & Embedding Similarity for non-exact photos
        remaining_photos = [p for p in photos if p['id'] not in visited_ids and p.get('phash')]
        n = len(remaining_photos)
        
        near_visited = set()
        threshold = settings.NEAR_DUPLICATE_PHASH_THRESHOLD
        cosine_threshold = settings.SIMILARITY_COSINE_THRESHOLD

        for i in range(n):
            p1 = remaining_photos[i]
            if p1['id'] in near_visited:
                continue

            current_group = []
            h1 = p1.get('phash')
            vec1 = p1.get('embedding')

            for j in range(i + 1, n):
                p2 = remaining_photos[j]
                if p2['id'] in near_visited:
                    continue

                is_near = False
                score = 0.0

                # Check pHash distance
                h2 = p2.get('phash')
                if h1 and h2:
                    dist = cls.phash_hamming_distance(h1, h2)
                    if dist <= threshold:
                        is_near = True
                        score = max(score, round(1.0 - (dist / 64.0), 3))

                # Check vector similarity if available
                vec2 = p2.get('embedding')
                if not is_near and vec1 and vec2:
                    cos_sim = cls.cosine_similarity(vec1, vec2)
                    if cos_sim >= cosine_threshold:
                        is_near = True
                        score = max(score, round(cos_sim, 3))

                if is_near:
                    current_group.append((p2, score))

            if current_group:
                near_visited.add(p1['id'])
                dup_list = []
                scores = []
                for p_dup, sc in current_group:
                    near_visited.add(p_dup['id'])
                    dup_list.append(p_dup)
                    scores.append(sc)

                avg_score = round(sum(scores) / len(scores), 3) if scores else 0.90
                near_groups.append({
                    'primary': p1,
                    'duplicates': dup_list,
                    'type': 'near',
                    'score': avg_score
                })

        return exact_groups, near_groups
