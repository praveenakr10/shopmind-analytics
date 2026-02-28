"""
Metadata Endpoints - Segment and Options Data
Provides static metadata for the dashboard UI
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/metadata", tags=["metadata"])


class Segment(BaseModel):
    """Segment metadata response model"""
    id: str
    label: str
    icon: str = "📊"
    description: str = ""


class SegmentsResponse(BaseModel):
    """Segments list response model"""
    segments: List[Segment]


class OptionsResponse(BaseModel):
    """Available options for form fields"""
    options: Dict[str, Any]


SEGMENTS_DATA = [
    Segment(
        id="high_value",
        label="High Value Customers",
        icon="💎",
        description="Premium spenders with high CLV"
    ),
    Segment(
        id="discount_driven",
        label="Discount Driven Shoppers",
        icon="🏷️",
        description="Price-sensitive, high discount usage"
    ),
    Segment(
        id="loyal",
        label="Loyal Repeat Buyers",
        icon="⭐",
        description="Consistent purchasers, low churn risk"
    ),
    Segment(
        id="churn_risk",
        label="Churn Risk Customers",
        icon="⚠️",
        description="High probability of abandonment"
    ),
]


def get_segments_map() -> Dict[str, dict]:
    """Convert segments list to dictionary for easy access"""
    return {seg.id: seg.dict() for seg in SEGMENTS_DATA}


@router.get("/segments", response_model=SegmentsResponse)
async def get_segments():
    """
    Get all customer segments.
    
    Returns segment definitions with IDs and labels for segment selection UI.
    """
    return SegmentsResponse(segments=SEGMENTS_DATA)


@router.get("/options", response_model=OptionsResponse)
async def get_options():
    """
    Get allowed options for form dropdowns.
    
    Returns commonly used options for form dropdowns based on typical
    e-commerce categories. These should be populated from allowed_options
    in the main app.
    """
    # Default options - these will be populated from the main app
    default_options = {
        "Category": ["Electronics", "Clothing", "Home", "Books", "Beauty", "Sports"],
        "Payment_Method": ["Credit Card", "Debit Card", "PayPal", "Apple Pay", "Google Pay"],
        "Shipping_Type": ["Standard", "Express", "Overnight", "Pickup"],
        "Season": ["Winter", "Spring", "Summer", "Fall"],
        "Gender": ["Male", "Female", "Other"],
    }
    return OptionsResponse(options=default_options)
