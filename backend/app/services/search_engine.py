import re
import numpy as np
from typing import List, Dict, Any, Optional
from app.services.duplicate_engine import DuplicateEngine

class SearchEngine:
    # Key semantic intent dictionary for zero-shot text search mapping
    SEMANTIC_KEYWORDS = {
        "documents": ["document", "pdf", "file", "paper", "contract", "certificate", "report", "letter", "license", "passport"],
        "prescriptions": ["prescription", "rx", "medicine", "pill", "doctor", "pharmacy", "health", "clinic", "medication"],
        "receipts": ["receipt", "invoice", "bill", "payment", "total", "cash", "tax", "purchase"],
        "people": ["people", "person", "face", "portrait", "friend", "family", "man", "woman", "girl", "boy", "selfie"],
        "travel": ["travel", "vacation", "trip", "beach", "mountain", "sea", "ocean", "nature", "landscape", "flight", "hotel", "outdoor", "sunset"],
        "pets": ["pet", "cat", "dog", "puppy", "kitten", "animal", "cute", "doggy"]
    }

    @classmethod
    def query_to_embedding(cls, text_query: str) -> List[float]:
        """
        Synthesize text feature vector representation for input query.
        Uses normalized token frequency vector across standard semantic spaces.
        """
        tokens = re.findall(r'\w+', text_query.lower())
        vec = np.zeros(128, dtype=np.float32)

        for i, token in enumerate(tokens):
            # Seed pseudo-vector based on hash of words
            h = hash(token) % 128
            vec[h] += 1.0 / (i + 1)

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    @classmethod
    def search(
        cls,
        photos: List[Dict],
        query: str = "",
        category: Optional[str] = None,
        person_id: Optional[int] = None,
        is_duplicate: Optional[bool] = None,
        source: Optional[str] = None
    ) -> List[Dict]:
        """
        Execute natural language semantic search and filter photos.
        Returns list of photos sorted by similarity score.
        """
        filtered = photos

        # 1. Exact attribute filtering
        if category and category != "all":
            filtered = [p for p in filtered if p.get("category") == category]

        if person_id is not None:
            filtered = [p for p in filtered if p.get("person_id") == person_id or any(f.get("person_id") == person_id for f in p.get("faces", []))]

        if is_duplicate is not None:
            filtered = [p for p in filtered if p.get("is_duplicate") == is_duplicate]

        if source and source != "all":
            filtered = [p for p in filtered if p.get("source") == source]

        if not query or not query.strip():
            return sorted(filtered, key=lambda x: x.get("created_at", ""), reverse=True)

        # 2. Natural Language Semantic & Vector Similarity Search
        query_str = query.strip().lower()
        query_vec = cls.query_to_embedding(query_str)
        tokens = set(re.findall(r'\w+', query_str))

        scored_results = []
        for p in filtered:
            score = 0.0

            # Text Keyword Matching (filename, extracted_text, category, tags)
            filename = (p.get("original_filename") or "").lower()
            ocr_text = (p.get("extracted_text") or "").lower()
            p_category = (p.get("category") or "").lower()
            tags = [t.lower() for t in p.get("tags") or []]

            # Direct word match boosts
            for token in tokens:
                if token in filename:
                    score += 0.4
                if token in p_category:
                    score += 0.5
                if any(token in t for t in tags):
                    score += 0.35
                if token in ocr_text:
                    score += 0.3

            # Semantic keyword category mapping boost
            for cat_key, cat_words in cls.SEMANTIC_KEYWORDS.items():
                if any(t in cat_words for t in tokens):
                    if p_category == cat_key:
                        score += 0.45

            # Vector Embedding Cosine Similarity
            p_vec = p.get("embedding")
            if p_vec:
                cos_sim = DuplicateEngine.cosine_similarity(query_vec, p_vec)
                score += cos_sim * 0.4

            if score > 0.05:
                p_copy = dict(p)
                p_copy["relevance_score"] = round(float(score), 3)
                scored_results.append(p_copy)

        # Sort by relevance score descending
        scored_results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
        return scored_results
