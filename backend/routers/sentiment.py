"""
Sentiment Router - NLP-based Sentiment Analysis from Review Ratings
Computes real sentiment metrics per segment and category from dataset.
"""

from fastapi import APIRouter
import pandas as pd
import numpy as np
import os

router = APIRouter(prefix="/sentiment", tags=["sentiment"])

_BASE = os.path.dirname(os.path.dirname(__file__))

try:
    _df = pd.read_csv(os.path.join(_BASE, "dataset", "shopping_trends.csv"))
    _df.columns = [c.strip() for c in _df.columns]
    _loaded = True
except Exception:
    _df = None
    _loaded = False


def _rating_to_sentiment(rating: float) -> str:
    if rating >= 4.0:
        return "Positive"
    elif rating >= 3.0:
        return "Neutral"
    else:
        return "Negative"


def _assign_segment(row):
    disc = row.get("Discount Applied", "No")
    disc_flag = disc == "Yes" if isinstance(disc, str) else bool(disc)
    prev = row.get("Previous Purchases", 0)
    rating = row.get("Review Rating", 3.0)
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


def _compute_sentiment_data():
    if _df is None:
        return None

    df = _df.copy()
    if "Review Rating" not in df.columns:
        return None

    df["Segment"] = df.apply(_assign_segment, axis=1)
    df["Sentiment"] = df["Review Rating"].apply(_rating_to_sentiment)

    segments = ["Premium Urgent Buyers", "Loyal Frequent Buyers", "Occasional Buyers", "Discount-Driven Shoppers"]
    ICONS = {
        "Premium Urgent Buyers":    "💎",
        "Loyal Frequent Buyers":    "⭐",
        "Occasional Buyers":        "🛍️",
        "Discount-Driven Shoppers": "🏷️",
    }
    COLORS = {
        "Premium Urgent Buyers":    "#6366f1",
        "Loyal Frequent Buyers":    "#10b981",
        "Occasional Buyers":        "#f59e0b",
        "Discount-Driven Shoppers": "#ef4444",
    }

    per_segment = []
    for seg in segments:
        seg_df = df[df["Segment"] == seg]
        if seg_df.empty:
            continue
        total = len(seg_df)
        pos   = int((seg_df["Sentiment"] == "Positive").sum())
        neu   = int((seg_df["Sentiment"] == "Neutral").sum())
        neg   = int((seg_df["Sentiment"] == "Negative").sum())
        avg_r = round(float(seg_df["Review Rating"].mean()), 3)
        avg_s = round(float(seg_df["Purchase Amount (USD)"].mean()), 2) if "Purchase Amount (USD)" in seg_df.columns else 0

        per_segment.append({
            "segment":              seg,
            "icon":                 ICONS.get(seg, "📊"),
            "color":                COLORS.get(seg, "#6366f1"),
            "size":                 total,
            "avg_rating":           avg_r,
            "avg_spend":            avg_s,
            "positive_count":       pos,
            "neutral_count":        neu,
            "negative_count":       neg,
            "positive_pct":         round(pos / total * 100, 1),
            "neutral_pct":          round(neu / total * 100, 1),
            "negative_pct":         round(neg / total * 100, 1),
            "sentiment_label":      _rating_to_sentiment(avg_r),
            "avg_sentiment_score":  round((avg_r - 1) / 4, 3),
        })

    # Category-level sentiment
    cat_sentiment = []
    if "Category" in df.columns:
        for cat in df["Category"].dropna().unique():
            cat_df = df[df["Category"] == cat]
            avg_r  = round(float(cat_df["Review Rating"].mean()), 3)
            total  = len(cat_df)
            pos    = int((cat_df["Sentiment"] == "Positive").sum())
            neg    = int((cat_df["Sentiment"] == "Negative").sum())
            cat_sentiment.append({
                "category":    cat,
                "avg_rating":  avg_r,
                "total":       total,
                "positive":    pos,
                "negative":    neg,
                "sentiment":   _rating_to_sentiment(avg_r),
                "score":       round((avg_r - 1) / 4, 3),
            })
        cat_sentiment.sort(key=lambda x: x["avg_rating"], reverse=True)

    # Overall
    overall_rating = round(float(df["Review Rating"].mean()), 3)
    overall_pos = int((df["Sentiment"] == "Positive").sum())
    overall_neu = int((df["Sentiment"] == "Neutral").sum())
    overall_neg = int((df["Sentiment"] == "Negative").sum())
    total_all   = len(df)

    return {
        "per_segment": per_segment,
        "per_category": cat_sentiment,
        "overall": {
            "avg_rating":      overall_rating,
            "avg_score":       round((overall_rating - 1) / 4, 3),
            "sentiment_label": _rating_to_sentiment(overall_rating),
            "positive_count":  overall_pos,
            "neutral_count":   overall_neu,
            "negative_count":  overall_neg,
            "positive_pct":    round(overall_pos / total_all * 100, 1),
            "neutral_pct":     round(overall_neu / total_all * 100, 1),
            "negative_pct":    round(overall_neg / total_all * 100, 1),
            "total":           total_all,
        }
    }


_sentiment_cache = None

def _get_sentiment():
    global _sentiment_cache
    if _sentiment_cache is None:
        _sentiment_cache = _compute_sentiment_data()
    return _sentiment_cache


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
def get_sentiment_overview():
    """Full sentiment analysis: per segment, per category, overall."""
    data = _get_sentiment()
    if data is None:
        return {"error": "Data not available", "per_segment": [], "per_category": [], "overall": {}}
    return data


@router.get("/segments")
def get_segment_sentiments():
    """Per-segment sentiment scores."""
    data = _get_sentiment()
    if data is None:
        return {"segments": []}
    return {"segments": data["per_segment"]}


@router.get("/categories")
def get_category_sentiments():
    """Per-category sentiment scores."""
    data = _get_sentiment()
    if data is None:
        return {"categories": []}
    return {"categories": data["per_category"]}


@router.get("/segment/{segment_id}")
def get_segment_sentiment(segment_id: str):
    """Sentiment for a specific segment."""
    seg_map = {
        "premium":    "Premium Urgent Buyers",
        "loyal":      "Loyal Frequent Buyers",
        "occasional": "Occasional Buyers",
        "discount":   "Discount-Driven Shoppers",
    }
    label = seg_map.get(segment_id.lower(), segment_id)
    data = _get_sentiment()
    if data is None:
        return {}
    matches = [s for s in data["per_segment"] if s["segment"] == label]
    return matches[0] if matches else {}
