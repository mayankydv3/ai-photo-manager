import re
from PIL import Image, ImageStat
import numpy as np
from typing import Dict, Tuple, List, Optional

class AICategorizer:
    CATEGORIES = ["documents", "prescriptions", "receipts", "people", "travel", "pets", "other"]

    RECEIPT_KEYWORDS = [
        "total", "subtotal", "tax", "cash", "amount", "change", "receipt",
        "visa", "mastercard", "payment", "date", "store", "thank you", "inv", "invoice", "balance"
    ]

    PRESCRIPTION_KEYWORDS = [
        "rx", "prescription", "pharmacy", "doctor", "dr.", "patient", "tablet",
        "capsule", "mg", "dosage", "take", "refill", "medication", "clinic", "dispense"
    ]

    DOCUMENT_KEYWORDS = [
        "certificate", "agreement", "contract", "report", "article", "letter",
        "statement", "page", "policy", "terms", "signature", "notice", "passport", "id card", "license"
    ]

    @classmethod
    def extract_ocr_text(cls, image: Image.Image) -> str:
        """Extract text from image using Tesseract OCR if available or mock text analyzer."""
        try:
            import pytesseract
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception:
            return ""

    @classmethod
    def analyze_image_heuristics(cls, image: Image.Image, filename: str = "", extracted_text: str = "") -> Tuple[str, float, List[str]]:
        """
        Analyze image properties, filenames, OCR text, and feature signatures to categorize.
        Returns: (category, confidence_score, tags)
        """
        fn_lower = filename.lower()
        text_lower = extracted_text.lower() if extracted_text else ""
        tags = []

        # 1. Filename & OCR keyword checks for Prescriptions
        for kw in cls.PRESCRIPTION_KEYWORDS:
            if kw in fn_lower or kw in text_lower:
                tags.extend(["health", "medical", "prescription", "pharmacy"])
                return "prescriptions", 0.95, list(set(tags))

        # 2. Receipt keyword checks
        receipt_matches = sum(1 for kw in cls.RECEIPT_KEYWORDS if kw in text_lower or kw in fn_lower)
        if receipt_matches >= 2 or "receipt" in fn_lower or "invoice" in fn_lower:
            tags.extend(["finance", "receipt", "payment", "bill"])
            return "receipts", 0.93, list(set(tags))

        # 3. Document keyword checks & high-contrast text paper signature
        doc_matches = sum(1 for kw in cls.DOCUMENT_KEYWORDS if kw in text_lower or kw in fn_lower)
        if doc_matches >= 1 or "doc" in fn_lower or "pdf" in fn_lower or "scan" in fn_lower:
            tags.extend(["document", "text", "official"])
            return "documents", 0.90, list(set(tags))

        # Check grayscale/high-contrast paper heuristic (white page with dark text)
        if cls._is_document_like_image(image):
            tags.extend(["document", "paper", "scanned"])
            return "documents", 0.82, list(set(tags))

        # 4. Keyword matches for pets, travel, people in filename or EXIF/tags
        if any(w in fn_lower for w in ["cat", "dog", "pet", "puppy", "kitten", "animal"]):
            tags.extend(["pets", "animal", "cute"])
            return "pets", 0.92, list(set(tags))

        if any(w in fn_lower for w in ["beach", "mountain", "vacation", "trip", "travel", "flight", "hotel", "nature", "paris"]):
            tags.extend(["travel", "vacation", "outdoor", "landscape"])
            return "travel", 0.91, list(set(tags))

        if any(w in fn_lower for w in ["portrait", "face", "selfie", "friend", "family", "person", "group"]):
            tags.extend(["people", "portrait", "person"])
            return "people", 0.88, list(set(tags))

        # 5. Visual color variance heuristics
        # Bright vibrant images with green/blue -> Travel/Nature
        # Soft warmth -> People/Pets
        stat = ImageStat.Stat(image.convert("RGB"))
        r, g, b = stat.mean
        std_r, std_g, std_b = stat.stddev

        if std_g > 45 and g > 90:
            tags.extend(["outdoor", "nature"])
            return "travel", 0.75, list(set(tags))

        if r > 120 and g > 100 and b > 80 and std_r > 30:
            tags.extend(["photo", "moment"])
            return "people", 0.70, list(set(tags))

        tags.append("photo")
        return "other", 0.65, tags

    @staticmethod
    def _is_document_like_image(image: Image.Image) -> bool:
        """Determines if an image is likely a document page based on aspect ratio & color distribution."""
        w, h = image.size
        aspect = h / float(w) if w > 0 else 1.0
        # Typical document aspect ratios ~ 1.3 - 1.5 (A4/Letter)
        if 1.2 <= aspect <= 1.6:
            gray = image.convert("L")
            stat = ImageStat.Stat(gray)
            mean = stat.mean[0]
            stddev = stat.stddev[0]
            # High mean (bright background) and moderate stddev (text contrast)
            if mean > 180 and stddev > 35:
                return True
        return False
