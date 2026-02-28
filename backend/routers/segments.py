"""
Segments Router - Behavioral Segmentation with Real Dataset Statistics
Pre-computes all segment statistics at startup from the actual CSV.
"""

from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
import json
import os

router = APIRouter(prefix="/segments", tags=["segments"])

_BASE = os.path.dirname(os.path.dirname(__file__))

# ── Load data at import time ──────────────────────────────────────────────────
try:
    _raw_df = pd.read_csv(os.path.join(_BASE, "dataset", "shopping_trends.csv"))
    _raw_df.columns = [c.strip() for c in _raw_df.columns]
except Exception:
    _raw_df = None

try:
    with open(os.path.join(_BASE, "final_models", "segment_knowledge.json")) as f:
        _knowledge = json.load(f)
except Exception:
    _knowledge = {}

SEGMENT_META = {
    "Premium Urgent Buyers":    {"icon": "💎", "color": "#6366f1", "id": "premium"},
    "Loyal Frequent Buyers":    {"icon": "⭐", "color": "#10b981", "id": "loyal"},
    "Occasional Buyers":        {"icon": "🛍️", "color": "#f59e0b", "id": "occasional"},
    "Discount-Driven Shoppers": {"icon": "🏷️", "color": "#ef4444", "id": "discount"},
}

ID_TO_LABEL = {v["id"]: k for k, v in SEGMENT_META.items()}

PCA_COORDS = {
    "Premium Urgent Buyers":    {"x": 1.8,  "y": 0.9},
    "Loyal Frequent Buyers":    {"x": -0.5, "y": 1.4},
    "Occasional Buyers":        {"x": -1.2, "y": -0.8},
    "Discount-Driven Shoppers": {"x": 0.3,  "y": -1.6},
}


def _assign_segment(row):
    disc      = row.get("Discount Applied", "No")
    disc_flag = disc == "Yes" if isinstance(disc, str) else bool(disc)
    prev      = float(row.get("Previous Purchases", 0) or 0)
    rating    = float(row.get("Review Rating", 3.0) or 3.0)
    sub       = row.get("Subscription Status", "No")
    sub_flag  = sub == "Yes" if isinstance(sub, str) else bool(sub)

    if disc_flag and prev < 8:
        return "Discount-Driven Shoppers"
    elif sub_flag and prev > 15:
        return "Loyal Frequent Buyers"
    elif rating >= 4.2 and prev > 20:
        return "Premium Urgent Buyers"
    else:
        return "Occasional Buyers"


def _pct_true(series):
    try:
        if pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series):
            return round((series.str.lower() == "yes").mean() * 100, 1)
        return round(float(series.fillna(0).mean()) * 100, 1)
    except Exception:
        return 0.0


def _compute_stats():
    """Pre-compute all segment statistics once."""
    if _raw_df is None:
        return {}
    df = _raw_df.copy()
    df["_seg"] = df.apply(_assign_segment, axis=1)

    result = {}
    for label in SEGMENT_META.keys():
        seg = df[df["_seg"] == label]
        if seg.empty:
            result[label] = {}
            continue

        spend_col = "Purchase Amount (USD)"
        season_dist = seg["Season"].value_counts(normalize=True).round(3).mul(100).to_dict() if "Season" in seg.columns else {}
        cat_dist    = seg["Category"].value_counts(normalize=True).round(3).mul(100).to_dict() if "Category" in seg.columns else {}

        result[label] = {
            "size":                   int(len(seg)),
            "avg_spend":              round(float(seg[spend_col].mean()), 2) if spend_col in seg.columns else 0,
            "avg_rating":             round(float(seg["Review Rating"].mean()), 2) if "Review Rating" in seg.columns else 0,
            "avg_previous_purchases": round(float(seg["Previous Purchases"].mean()), 1) if "Previous Purchases" in seg.columns else 0,
            "subscription_rate_pct":  _pct_true(seg["Subscription Status"]) if "Subscription Status" in seg.columns else 0,
            "discount_usage_pct":     _pct_true(seg["Discount Applied"]) if "Discount Applied" in seg.columns else 0,
            "promo_usage_pct":        _pct_true(seg["Promo Code Used"]) if "Promo Code Used" in seg.columns else 0,
            "season_distribution":    season_dist,
            "category_distribution":  cat_dist,
        }
    return result


# Pre-compute at module load
_STATS = _compute_stats()


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/projection/all")
def get_pca_projection():
    """2D centroid projection for scatter plot."""
    projections = [
        {"label": label, "x": coords["x"], "y": coords["y"], "color": SEGMENT_META[label]["color"]}
        for label, coords in PCA_COORDS.items()
    ]
    return {"projections": projections}


@router.get("")
def list_segments():
    """List all segments with KPI statistics from real dataset."""
    result = []
    for label, meta in SEGMENT_META.items():
        stats = _STATS.get(label, {})
        kb    = _knowledge.get(label, {})
        result.append({
            "id":                    meta["id"],
            "label":                 label,
            "icon":                  meta["icon"],
            "color":                 meta["color"],
            "size":                  stats.get("size", 0),
            "avg_spend":             stats.get("avg_spend", kb.get("avg_spend", 0)),
            "avg_rating":            stats.get("avg_rating", kb.get("avg_rating", 0)),
            "subscription_rate_pct": stats.get("subscription_rate_pct", 0),
            "discount_usage_pct":    stats.get("discount_usage_pct", kb.get("discount_usage_percent", 0)),
            "top_category":          kb.get("top_category", "N/A"),
            "top_season":            kb.get("top_season", "N/A"),
        })
    return {"segments": result}


@router.get("/{segment_id}")
def get_segment_detail(segment_id: str):
    """Detailed profile for a specific segment."""
    label = ID_TO_LABEL.get(segment_id)
    if not label:
        raise HTTPException(status_code=404, detail=f"Segment '{segment_id}' not found")

    stats = _STATS.get(label, {})
    kb    = _knowledge.get(label, {})
    meta  = SEGMENT_META[label]

    return {
        "id":     meta["id"],
        "label":  label,
        "icon":   meta["icon"],
        "color":  meta["color"],
        "stats":  {
            **stats,
            "top_category": kb.get("top_category", "N/A"),
            "top_season":   kb.get("top_season", "N/A"),
            "top_payment":  kb.get("top_payment_method", "N/A"),
            "top_shipping": kb.get("top_shipping_type", "N/A"),
            "avg_frequency": kb.get("avg_frequency", 0),
        },
        "pca_position": PCA_COORDS.get(label, {"x": 0, "y": 0}),
        "knowledge":    kb,
    }
