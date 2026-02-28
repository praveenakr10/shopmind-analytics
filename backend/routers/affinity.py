"""
Affinity Router - Category Affinity & Association Rule Analysis
Normalizes affinity scores proportionally within each segment to eliminate
the 100% ceiling issue caused by raw count-based calculation.
"""

from fastapi import APIRouter
import pandas as pd
import numpy as np
import os
from collections import defaultdict

router = APIRouter(prefix="/affinity", tags=["affinity"])

_BASE = os.path.dirname(os.path.dirname(__file__))

try:
    _df = pd.read_csv(os.path.join(_BASE, "dataset", "shopping_trends.csv"))
    _df.columns = [c.strip() for c in _df.columns]
    _loaded = True
except Exception:
    _df = None
    _loaded = False

MIN_SUPPORT_THRESHOLD = 0.20  # transparent, returned in metadata


def _assign_segment(row):
    """Rule-based segment assignment (consistent across all routers)."""
    disc     = row.get("Discount Applied", "No")
    disc_flag = disc == "Yes" if isinstance(disc, str) else bool(disc)
    prev     = float(row.get("Previous Purchases", 0) or 0)
    rating   = float(row.get("Review Rating", 3.0) or 3.0)
    sub      = row.get("Subscription Status", "No")
    sub_flag = sub == "Yes" if isinstance(sub, str) else bool(sub)
    if disc_flag and prev < 8:        return "Discount-Driven Shoppers"
    elif sub_flag and prev > 15:      return "Loyal Frequent Buyers"
    elif rating >= 4.2 and prev > 20: return "Premium Urgent Buyers"
    else:                             return "Occasional Buyers"


def _compute_normalized_affinity():
    """
    Compute category affinity per segment with proper normalization.
    
    Method: For each segment, compute the category purchase share (count/total).
    Then normalize within the segment so the highest-affinity category = 1.0,
    others are relative. This eliminates the misleading 100% ceiling where
    multiple categories all appear at maximum.
    
    Returns: dict[segment_label] -> {category: normalized_score (0–1), ...}
    """
    if _df is None:
        return {}

    df = _df.copy()
    df["_seg"] = df.apply(_assign_segment, axis=1)

    categories = sorted(df["Category"].dropna().unique().tolist()) if "Category" in df.columns else []
    seasons    = sorted(df["Season"].dropna().unique().tolist())   if "Season" in df.columns else []

    result = {}
    for seg_label in ["Premium Urgent Buyers", "Loyal Frequent Buyers",
                      "Occasional Buyers", "Discount-Driven Shoppers"]:
        seg = df[df["_seg"] == seg_label]
        n   = max(len(seg), 1)
        spend_col = "Purchase Amount (USD)"

        # Raw proportional share for each category
        raw_cat = {}
        for cat in categories:
            cat_rows = seg[seg["Category"] == cat]
            n_cat    = len(cat_rows)
            if n_cat == 0:
                raw_cat[cat] = 0.0
                continue
            # Weight by avg spend ratio vs overall avg spend in that category
            seg_avg    = cat_rows[spend_col].mean() if spend_col in cat_rows.columns else 0
            global_avg = df[df["Category"] == cat][spend_col].mean() if spend_col in df.columns else 1
            spend_ratio = seg_avg / max(global_avg, 1)
            raw_cat[cat] = (n_cat / n) * spend_ratio

        # Normalize: max raw value in this segment = 1.0
        max_val = max(raw_cat.values()) if raw_cat else 1.0
        max_val = max(max_val, 1e-9)
        cat_affinity = {cat: round(v / max_val, 4) for cat, v in raw_cat.items()}

        # Season distribution (already proportional, no ceiling issue)
        season_aff = {}
        for season in seasons:
            cnt = len(seg[seg["Season"] == season]) if "Season" in seg.columns else 0
            season_aff[season] = round(cnt / n, 4)

        result[seg_label] = {
            "category_affinity": cat_affinity,
            "season_affinity":   season_aff,
            "size":              int(n),
        }
    return result


def _compute_rules():
    """
    Category association rules using segment co-occurrence analysis.
    Computes support, confidence, lift, and a human-readable strength label.
    """
    if _df is None:
        return []

    df = _df.copy()
    if "Category" not in df.columns:
        return []

    categories = df["Category"].dropna().unique().tolist()
    n_total    = len(df)

    df["_seg"] = df.apply(_assign_segment, axis=1)
    cat_counts = df["Category"].value_counts().to_dict()

    rules = []
    for cat_a in categories:
        for cat_b in categories:
            if cat_a == cat_b:
                continue
            segs_a = set(df[df["Category"] == cat_a]["_seg"].unique())
            segs_b = set(df[df["Category"] == cat_b]["_seg"].unique())
            shared = segs_a & segs_b
            if not shared:
                continue

            support    = round(len(shared) / 4.0, 4)
            cnt_a      = cat_counts.get(cat_a, 1)
            cnt_b      = cat_counts.get(cat_b, 1)
            confidence = round(min(cnt_b / cnt_a, 1.0) * len(shared) / 4.0 + 0.1, 4)
            lift       = round(confidence / max(cnt_b / n_total, 0.001), 4)

            if support >= MIN_SUPPORT_THRESHOLD:
                lift_label = "Strong" if lift >= 2.0 else ("Moderate" if lift >= 1.3 else "Weak")
                rules.append({
                    "antecedent":    cat_a,
                    "consequent":    cat_b,
                    "support":       support,
                    "confidence":    confidence,
                    "lift":          lift,
                    "lift_strength": lift_label,
                })

    rules.sort(key=lambda r: r["lift"], reverse=True)
    seen, unique = set(), []
    for r in rules:
        key = tuple(sorted([r["antecedent"], r["consequent"]]))
        if key not in seen:
            seen.add(key)
            unique.append(r)
    return unique[:20]


# ── Pre-compute at startup ────────────────────────────────────────────────────
_affinity_data = _compute_normalized_affinity()
_rules_data    = _compute_rules()


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
def get_affinity_overview():
    """Category affinity matrix per segment (normalized, no 100% ceiling)."""
    data    = _affinity_data
    segs    = list(data.keys())
    cats    = sorted(set(cat for v in data.values() for cat in v.get("category_affinity", {})))

    matrix = []
    for seg, vals in data.items():
        row = {"segment": seg}
        row.update(vals.get("category_affinity", {}))
        matrix.append(row)

    top_rules = sorted(_rules_data, key=lambda r: r["lift"], reverse=True)[:3]

    return {
        "segments":           segs,
        "categories":         cats,
        "affinity_matrix":    matrix,
        "association_rules":  _rules_data,
        "total_rules":        len(_rules_data),
        "top_bundles":        top_rules,
        "min_support":        MIN_SUPPORT_THRESHOLD,
        "normalization":      "relative-to-segment-max",
    }


@router.get("/rules")
def get_association_rules(min_lift: float = 1.0):
    """Association rules filtered by minimum lift threshold."""
    filtered = [r for r in _rules_data if r["lift"] >= min_lift]
    return {
        "rules":       filtered,
        "total":       len(filtered),
        "min_lift":    min_lift,
        "min_support": MIN_SUPPORT_THRESHOLD,
    }


@router.get("/segment/{segment_id}")
def get_segment_affinity(segment_id: str):
    """Affinity data for a specific segment."""
    id_map = {
        "premium":    "Premium Urgent Buyers",
        "loyal":      "Loyal Frequent Buyers",
        "occasional": "Occasional Buyers",
        "discount":   "Discount-Driven Shoppers",
    }
    label = id_map.get(segment_id)
    if not label or label not in _affinity_data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Segment '{segment_id}' not found")

    d = _affinity_data[label]
    return {
        "segment_id":        segment_id,
        "segment_label":     label,
        "category_affinity": d.get("category_affinity", {}),
        "season_affinity":   d.get("season_affinity", {}),
        "size":              d.get("size", 0),
    }
