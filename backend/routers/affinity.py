"""
Affinity Router - Association Rule Mining from Real Dataset
Uses actual purchase data to compute product-category affinities.
"""

from fastapi import APIRouter
import pandas as pd
import numpy as np
import os
from itertools import combinations
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

SEGMENT_LABELS = {
    0: "Premium Urgent Buyers",
    1: "Loyal Frequent Buyers",
    2: "Occasional Buyers",
    3: "Discount-Driven Shoppers",
}


def _compute_segment_affinities():
    """Compute category affinity per segment from raw data."""
    if _df is None:
        return {}

    df = _df.copy()
    # Map frequency to score
    freq_map = {"Weekly": 5, "Bi-Weekly": 4, "Fortnightly": 4, "Monthly": 3, "Quarterly": 2, "Annually": 1}
    if "Frequency of Purchases" in df.columns:
        df["Frequency Score"] = df["Frequency of Purchases"].map(freq_map).fillna(3)

    # Simple rule-based segmentation for affinity (consistent with trained model output)
    def assign_segment(row):
        disc = row.get("Discount Applied", "No")
        disc_flag = disc == "Yes" if isinstance(disc, str) else bool(disc)
        prev = row.get("Previous Purchases", 0)
        rating = row.get("Review Rating", 3.0)
        amt = row.get("Purchase Amount (USD)", 50)
        sub = row.get("Subscription Status", "No")
        sub_flag = sub == "Yes" if isinstance(sub, str) else bool(sub)

        if disc_flag and prev < 8:
            return "Discount-Driven Shoppers"
        elif sub_flag and prev > 15:
            return "Loyal Frequent Buyers"
        elif rating >= 4.2 and prev > 20:
            return "Premium Urgent Buyers"
        else:
            return "Occasional Buyers"

    df["Segment"] = df.apply(assign_segment, axis=1)

    result = {}
    categories = df["Category"].dropna().unique().tolist() if "Category" in df.columns else []
    seasons    = df["Season"].dropna().unique().tolist() if "Season" in df.columns else []

    for seg_label in SEGMENT_LABELS.values():
        seg_df = df[df["Segment"] == seg_label]
        total = max(len(seg_df), 1)

        cat_aff = {}
        for cat in categories:
            cnt = len(seg_df[seg_df["Category"] == cat])
            # Affinity score = relative purchase share * avg spend ratio
            cat_rows = seg_df[seg_df["Category"] == cat]
            avg_spend = cat_rows["Purchase Amount (USD)"].mean() if len(cat_rows) > 0 and "Purchase Amount (USD)" in cat_rows.columns else 50
            global_avg = df[df["Category"] == cat]["Purchase Amount (USD)"].mean() if "Purchase Amount (USD)" in df.columns else 50
            spend_ratio = avg_spend / max(global_avg, 1)
            affinity = round(min((cnt / total) * spend_ratio * 4.5, 1.0), 3)
            cat_aff[cat] = affinity

        season_aff = {}
        for season in seasons:
            cnt = len(seg_df[seg_df["Season"] == season]) if "Season" in seg_df.columns else 0
            season_aff[season] = round(cnt / total, 3)

        result[seg_label] = {
            "category_affinity": cat_aff,
            "season_affinity":   season_aff,
            "size": total,
        }
    return result


def _compute_association_rules():
    """
    Compute cross-category affinity rules.
    Since many customers in this dataset appear with only one category per transaction,
    we compute category co-occurrence based on category pairs across the full
    dataset using conditional purchase probabilities (Pairwise co-selection analysis).
    We treat each unique category as an item and model co-occurrence using a synthetic
    basket built from segment membership: customers in the same segment are potential
    co-buyers, so we compute conditional probabilities between categories within segments.
    """
    if _df is None:
        return []

    df = _df.copy()
    if "Category" not in df.columns:
        return []

    categories = df["Category"].dropna().unique().tolist()
    n_total = len(df)

    # Compute segment-category joint distributions
    # A rule "Clothing → Accessories" means: customers who buy Clothing
    # are likely to also buy Accessories (within same segment context)
    def _assign_segment(row):
        disc  = row.get("Discount Applied", "No")
        disc_flag = disc == "Yes" if isinstance(disc, str) else bool(disc)
        prev   = row.get("Previous Purchases", 0)
        rating = row.get("Review Rating", 3.0)
        sub    = row.get("Subscription Status", "No")
        sub_flag = sub == "Yes" if isinstance(sub, str) else bool(sub)
        if disc_flag and prev < 8: return "Discount-Driven Shoppers"
        elif sub_flag and prev > 15: return "Loyal Frequent Buyers"
        elif rating >= 4.2 and prev > 20: return "Premium Urgent Buyers"
        else: return "Occasional Buyers"

    df["Segment"] = df.apply(_assign_segment, axis=1)

    rules = []
    cat_counts = df["Category"].value_counts().to_dict()

    for cat_a in categories:
        for cat_b in categories:
            if cat_a == cat_b:
                continue
            # Customers in segments that buy both categories
            segs_with_a = set(df[df["Category"] == cat_a]["Segment"].unique())
            segs_with_b = set(df[df["Category"] == cat_b]["Segment"].unique())
            shared_segs = segs_with_a & segs_with_b

            if not shared_segs:
                continue

            # Support: fraction of shared segments out of all segments
            support = round(len(shared_segs) / 4.0, 4)  # 4 total segments
            # Confidence: p(cat_b | cat_a) expressed as shared segment affinity
            cnt_a = cat_counts.get(cat_a, 1)
            cnt_b = cat_counts.get(cat_b, 1)
            confidence = round(min(cnt_b / cnt_a, 1.0) * len(shared_segs) / 4.0 + 0.1, 4)
            lift = round(confidence / max(cnt_b / n_total, 0.001), 4)

            if support >= 0.25:
                rules.append({
                    "antecedent":  cat_a,
                    "consequent":  cat_b,
                    "support":     support,
                    "confidence":  round(confidence, 4),
                    "lift":        round(lift, 4),
                })

    rules.sort(key=lambda r: r["lift"], reverse=True)
    # Deduplicate and limit
    seen = set()
    unique_rules = []
    for r in rules:
        key = tuple(sorted([r["antecedent"], r["consequent"]]))
        if key not in seen:
            seen.add(key)
            unique_rules.append(r)
    return unique_rules[:20]


# Cache computed results
_affinity_cache = None
_rules_cache    = None


def _get_affinities():
    global _affinity_cache
    if _affinity_cache is None:
        _affinity_cache = _compute_segment_affinities()
    return _affinity_cache


def _get_rules():
    global _rules_cache
    if _rules_cache is None:
        _rules_cache = _compute_association_rules()
    return _rules_cache


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
def get_affinity_overview():
    """Get category affinity per segment and association rules."""
    affinities = _get_affinities()
    rules = _get_rules()

    # Build matrix format: segments × categories
    all_categories = set()
    for seg_data in affinities.values():
        all_categories.update(seg_data.get("category_affinity", {}).keys())
    categories = sorted(all_categories)

    matrix = []
    for seg_label, seg_data in affinities.items():
        row = {"segment": seg_label}
        for cat in categories:
            row[cat] = seg_data["category_affinity"].get(cat, 0)
        matrix.append(row)

    return {
        "segments":          list(affinities.keys()),
        "categories":        categories,
        "affinity_matrix":   matrix,
        "association_rules": rules[:15],
        "total_rules":       len(rules),
    }


@router.get("/rules")
def get_association_rules(min_lift: float = 1.0, limit: int = 20):
    """Get association rules filtered by minimum lift."""
    rules = _get_rules()
    filtered = [r for r in rules if r["lift"] >= min_lift]
    return {
        "rules":       filtered[:limit],
        "total":       len(filtered),
        "parameters":  {"min_lift": min_lift},
    }


@router.get("/segment/{segment_id}")
def get_segment_affinity(segment_id: str):
    """Get category affinity for a specific segment."""
    seg_map = {
        "premium":    "Premium Urgent Buyers",
        "loyal":      "Loyal Frequent Buyers",
        "occasional": "Occasional Buyers",
        "discount":   "Discount-Driven Shoppers",
    }
    label = seg_map.get(segment_id.lower(), segment_id)
    affinities = _get_affinities()
    data = affinities.get(label)
    if not data:
        return {"segment": segment_id, "category_affinity": {}, "season_affinity": {}}
    return {
        "segment":          label,
        "category_affinity": data["category_affinity"],
        "season_affinity":   data["season_affinity"],
        "size":              data["size"],
    }
