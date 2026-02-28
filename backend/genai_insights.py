import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://router.huggingface.co/v1/chat/completions"

HF_TOKEN = os.getenv("HF_TOKEN")

headers = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/json"
}

MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct:novita"


def generate_advanced_insights(prediction_type: str, data: dict) -> str:
    """
    Generates business insights using Hugging Face Llama 3.1.
    """

    if not HF_TOKEN:
        return "HF_TOKEN not configured."

    customer_profile = json.dumps(data.get("customer_input", {}), indent=2)

    prompt = ""

    # ---------------- Subscription Case ----------------
    if prediction_type == "subscription":
        prob = data.get("probability", 0) * 100

        prompt = f"""
As an expert marketing analyst, analyze the following customer profile:

Customer Profile:
{customer_profile}

Predicted Subscription Probability: {prob:.1f}%

Provide:
1. A brief 2-3 sentence business explanation.
2. One concrete marketing action.
"""

    # ---------------- Anomaly Case ----------------
    elif prediction_type == "anomaly":
        prompt = f"""
As an expert risk analyst, analyze this flagged customer profile:

{customer_profile}

Provide:
1. A 2-3 sentence explanation of why this behavior might be unusual.
2. One recommended review action.
"""

    # ---------------- Multi Model Case ----------------
    elif prediction_type == "multi_model":
        clv = data.get("clv", 0)
        churn_prob = data.get("churn_probability", 0) * 100
        sentiment_map = {0: "Negative", 1: "Neutral", 2: "Positive"}
        sentiment_str = sentiment_map.get(data.get("sentiment", 1))

        prompt = f"""
As a senior business strategist, analyze this customer:

Customer Profile:
{customer_profile}

Predicted CLV: ${clv:,.2f}
Churn Probability: {churn_prob:.1f}%
Sentiment: {sentiment_str}

Provide:
1. A 3-4 sentence strategic summary.
2. One high-impact business action.
"""

    else:
        return "Invalid prediction type."

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "system",
                "content": "You are a senior e-commerce growth strategist."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 500
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload)

        if response.status_code != 200:
            return f"HF API Error: {response.json()}"

        result = response.json()
        return result["choices"][0]["message"]["content"]

    except Exception as e:
        return f"Error generating insights: {str(e)}"