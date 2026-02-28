"""
Strategy Router - Business Intelligence & Actionable Recommendations
Combines ML outputs to generate segment-level and per-customer strategies.
"""

from fastapi import APIRouter
import json
import os

router = APIRouter(prefix="/strategy", tags=["strategy"])

_BASE = os.path.dirname(os.path.dirname(__file__))

try:
    with open(os.path.join(_BASE, "final_models", "segment_knowledge.json")) as f:
        _knowledge = json.load(f)
except Exception:
    _knowledge = {}

import pandas as pd
try:
    _df = pd.read_csv(os.path.join(_BASE, "dataset", "shopping_trends.csv"))
    _df.columns = [c.strip() for c in _df.columns]
except Exception:
    _df = None

SEGMENT_LABELS = {
    "Premium Urgent Buyers":    {"icon": "💎", "color": "#6366f1", "id": "premium"},
    "Loyal Frequent Buyers":    {"icon": "⭐", "color": "#10b981", "id": "loyal"},
    "Occasional Buyers":        {"icon": "🛍️", "color": "#f59e0b", "id": "occasional"},
    "Discount-Driven Shoppers": {"icon": "🏷️", "color": "#ef4444", "id": "discount"},
}

# ── Strategy Knowledge Base ────────────────────────────────────────────────────

SEGMENT_STRATEGIES = {
    "Premium Urgent Buyers": {
        "retention_priority": "High",
        "churn_risk": "Low",
        "margin_risk": "Low",
        "pricing_intensity": "No discount",
        "recommended_discount_pct": 0,
        "campaign_type": "Premium Loyalty + VIP Early Access",
        "communication_frequency": "Bi-Weekly",
        "channels": ["Email", "Push Notification", "WhatsApp"],
        "actions": [
            "Launch VIP early access for new product arrivals",
            "Offer complimentary express shipping on all orders",
            "Create exclusive loyalty tier with premium perks",
            "Target with high-margin upsells and premium bundles",
            "Personalize recommendations based on Express shipping preference",
        ],
        "upsell_ideas": [
            "Bundle premium accessories with flagship products",
            "Exclusive members-only product lines",
        ],
        "expected_roi": "35–45%",
        "kpi_targets": {
            "clv_increase_pct": 18,
            "retention_rate":   92,
            "nps_target":       72,
        },
        "strategic_summary": (
            "Premium Urgent Buyers are your highest-value segment. They spend ~$81/order with "
            "strong ratings (4.0 avg). Focus on premium experiences, VIP access, and frictionless "
            "express delivery. Avoid discounts — they diminish perceived brand value with this segment."
        ),
    },
    "Loyal Frequent Buyers": {
        "retention_priority": "High",
        "churn_risk": "Low",
        "margin_risk": "Low",
        "pricing_intensity": "Light",
        "recommended_discount_pct": 10,
        "campaign_type": "Loyalty Rewards + Referral Program",
        "communication_frequency": "Weekly",
        "channels": ["Email", "SMS", "Push Notification"],
        "actions": [
            "Implement a tiered loyalty points program",
            "Run referral campaigns with double-points incentives",
            "Offer exclusive subscriber-only flash sales (10% off)",
            "Send personalized anniversary and milestone offers",
            "Leverage Free Shipping preference to increase basket size",
        ],
        "upsell_ideas": [
            "Subscription upgrade incentives for premium tiers",
            "Category cross-sells based on Clothing purchase history",
        ],
        "expected_roi": "28–35%",
        "kpi_targets": {
            "clv_increase_pct": 15,
            "retention_rate":   89,
            "nps_target":       65,
        },
        "strategic_summary": (
            "Loyal Frequent Buyers represent a stable revenue base with avg spend $70 and 42% "
            "discount usage. Nurture them with loyalty rewards and referral programs. Light discounts "
            "on peak seasons (Winter) will maximize conversion without margin erosion."
        ),
    },
    "Occasional Buyers": {
        "retention_priority": "Medium",
        "churn_risk": "Medium",
        "margin_risk": "Medium",
        "pricing_intensity": "Moderate",
        "recommended_discount_pct": 15,
        "campaign_type": "Re-engagement + Seasonal Campaigns",
        "communication_frequency": "Monthly",
        "channels": ["Email", "Social Media Retargeting"],
        "actions": [
            "Run targeted summer seasonal campaigns (top season)",
            "Offer 15% welcome-back discount after 60-day inactivity",
            "Use PayPal-specific offers aligned with payment preference",
            "Create FOMO-driven limited-time bundles",
            "Deploy retargeting ads on social for abandoned carts",
        ],
        "upsell_ideas": [
            "Seasonal bundles paired with complementary categories",
            "Store Pickup incentives — free gift with in-store order",
        ],
        "expected_roi": "18–25%",
        "kpi_targets": {
            "clv_increase_pct": 10,
            "retention_rate":   65,
            "nps_target":       55,
        },
        "strategic_summary": (
            "Occasional Buyers are infrequent but have a surprisingly high avg rating (4.4). "
            "They respond well to seasonal triggers (Summer) and moderate discounts. Re-engagement "
            "campaigns timed around their seasonal preference will convert them to regulars."
        ),
    },
    "Discount-Driven Shoppers": {
        "retention_priority": "Medium",
        "churn_risk": "High",
        "margin_risk": "High",
        "pricing_intensity": "Heavy",
        "recommended_discount_pct": 25,
        "campaign_type": "Flash Sale + Clearance + Bundle Deals",
        "communication_frequency": "Weekly",
        "channels": ["Email", "SMS", "Push Notification", "Coupon Apps"],
        "actions": [
            "Deploy flash sales aligned with Spring season preference",
            "Offer Cash payment cashback deals (top payment method)",
            "Create bulk-buy discounts to increase AOV above $38 avg",
            "Set discount caps at 25% to protect margins",
            "Run BOGO (Buy One Get One) promotions in Clothing",
        ],
        "upsell_ideas": [
            "Bundle clearance items with bestsellers at 20% off",
            "Introduce a 'value membership' at low monthly cost",
        ],
        "expected_roi": "12–18%",
        "kpi_targets": {
            "clv_increase_pct": 8,
            "retention_rate":   55,
            "nps_target":       45,
        },
        "strategic_summary": (
            "Discount-Driven Shoppers (avg spend $38) are highly price-sensitive with 47% discount "
            "usage. They churn quickly without incentives. Heavy promotional campaigns during Spring "
            "with Cash payment offers will maximize conversions — while strict discount caps "
            "protect your margins."
        ),
    },
}


def _assign_segment_from_id(segment_id: str):
    seg_map = {
        "premium":    "Premium Urgent Buyers",
        "loyal":      "Loyal Frequent Buyers",
        "occasional": "Occasional Buyers",
        "discount":   "Discount-Driven Shoppers",
    }
    return seg_map.get(segment_id.lower(), None)


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
def get_all_strategies():
    """Get actionable strategies for all segments."""
    result = []
    for seg_label, strategy in SEGMENT_STRATEGIES.items():
        meta = SEGMENT_LABELS.get(seg_label, {})
        kb   = _knowledge.get(seg_label, {})
        result.append({
            "segment_id":    meta.get("id"),
            "segment_label": seg_label,
            "icon":          meta.get("icon", "📊"),
            "color":         meta.get("color", "#6366f1"),
            "avg_spend":     kb.get("avg_spend", 0),
            **strategy,
        })
    return {"strategies": result}


@router.get("/segment/{segment_id}")
def get_segment_strategy(segment_id: str):
    """Get detailed strategy for a specific segment."""
    label = _assign_segment_from_id(segment_id)
    if not label:
        # Try direct match
        label = next((k for k in SEGMENT_STRATEGIES if k.lower().replace(" ", "_") == segment_id.lower()), None)
    if not label:
        return {"error": f"Segment '{segment_id}' not found", "segment_id": segment_id}

    strategy = SEGMENT_STRATEGIES.get(label, {})
    meta = SEGMENT_LABELS.get(label, {})
    kb   = _knowledge.get(label, {})

    return {
        "segment_id":    meta.get("id"),
        "segment_label": label,
        "icon":          meta.get("icon", "📊"),
        "color":         meta.get("color", "#6366f1"),
        "avg_spend":     kb.get("avg_spend", 0),
        "top_category":  kb.get("top_category", "N/A"),
        "top_season":    kb.get("top_season", "N/A"),
        **strategy,
    }


@router.get("/compare/{seg1}/{seg2}")
def compare_segment_strategies(seg1: str, seg2: str):
    """Compare strategies and KPIs for two segments."""
    label1 = _assign_segment_from_id(seg1)
    label2 = _assign_segment_from_id(seg2)
    s1 = SEGMENT_STRATEGIES.get(label1, {}) if label1 else {}
    s2 = SEGMENT_STRATEGIES.get(label2, {}) if label2 else {}
    kb1 = _knowledge.get(label1, {}) if label1 else {}
    kb2 = _knowledge.get(label2, {}) if label2 else {}
    m1 = SEGMENT_LABELS.get(label1, {}) if label1 else {}
    m2 = SEGMENT_LABELS.get(label2, {}) if label2 else {}

    # Build comparison metrics
    metrics = ["retention_priority", "churn_risk", "margin_risk", "pricing_intensity",
               "recommended_discount_pct", "expected_roi", "communication_frequency"]

    comparison = {
        "segment_1": {
            "id": seg1, "label": label1, "icon": m1.get("icon"), "color": m1.get("color"),
            "avg_spend": kb1.get("avg_spend", 0),
            **{m: s1.get(m) for m in metrics},
            "kpi_targets": s1.get("kpi_targets", {}),
            "top_actions": s1.get("actions", [])[:3],
        },
        "segment_2": {
            "id": seg2, "label": label2, "icon": m2.get("icon"), "color": m2.get("color"),
            "avg_spend": kb2.get("avg_spend", 0),
            **{m: s2.get(m) for m in metrics},
            "kpi_targets": s2.get("kpi_targets", {}),
            "top_actions": s2.get("actions", [])[:3],
        },
    }
    return comparison
