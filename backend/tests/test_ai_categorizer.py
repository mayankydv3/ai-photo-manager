from PIL import Image
from app.services.ai_categorizer import AICategorizer

def test_prescription_categorization():
    img = Image.new("RGB", (300, 300), color="white")
    cat, conf, tags = AICategorizer.analyze_image_heuristics(
        img,
        filename="prescription_rx_doctor.jpg",
        extracted_text="CVS Pharmacy Rx #1920 Dr Smith Take 1 tablet daily"
    )
    assert cat == "prescriptions"
    assert conf >= 0.90
    assert "prescription" in tags

def test_receipt_categorization():
    img = Image.new("RGB", (300, 300), color="white")
    cat, conf, tags = AICategorizer.analyze_image_heuristics(
        img,
        filename="store_receipt.jpg",
        extracted_text="Walmart Total: $45.00 Tax: $3.50 Cash Thank you"
    )
    assert cat == "receipts"
    assert conf >= 0.90

def test_pet_categorization():
    img = Image.new("RGB", (300, 300), color="green")
    cat, conf, tags = AICategorizer.analyze_image_heuristics(
        img,
        filename="my_golden_retriever_dog.jpg"
    )
    assert cat == "pets"
