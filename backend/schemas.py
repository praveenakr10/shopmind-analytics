from pydantic import BaseModel, Field
from typing import List
from enum import Enum


class MarginRisk(str, Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"


class PricingIntensity(str, Enum):
    Heavy = "Heavy"
    Moderate = "Moderate"
    Light = "Light"
    No_discount = "No discount"


class ChurnRisk(str, Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"


class StrategyOutput(BaseModel):
    discount_strategy: str
    campaign_type: str
    margin_risk: MarginRisk
    pricing_intensity: PricingIntensity
    recommended_discount_percent: int = Field(..., ge=0, le=80)
    upsell_ideas: List[str] = Field(..., min_items=2, max_items=3)
    churn_risk_level: ChurnRisk
    inventory_focus: str
    strategic_summary_for_store_owner: str