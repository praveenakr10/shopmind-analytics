import os
import requests
import json
from dotenv import load_dotenv
from schemas import StrategyOutput

load_dotenv() 

API_URL = "https://router.huggingface.co/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {os.getenv('HF_TOKEN')}",
    "Content-Type": "application/json"
}

MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct:novita"

def generate_strategy(customer_input: dict,
                      prediction_output: dict,
                      external_context: str = "None provided"):

    system_prompt = """
You are a senior e-commerce growth strategist.

You MUST return output strictly in valid JSON format.
Do NOT include markdown.
Do NOT include triple backticks.
Do NOT include explanation outside JSON.

Return JSON in this exact schema:

{
  "discount_strategy": "string",
  "campaign_type": "string",
  "margin_risk": "Low | Medium | High",
  "pricing_intensity": "Heavy | Moderate | Light | No discount",
  "recommended_discount_percent": integer (0-80),
  "upsell_ideas": ["string", "string"],
  "churn_risk_level": "Low | Medium | High",
  "inventory_focus": "string",
  "strategic_summary_for_store_owner": "string"
}
"""

    user_prompt = f"""
Customer Input:
{json.dumps(customer_input, indent=2)}

Behavioral Prediction Output:
{json.dumps(prediction_output, indent=2)}

External Market Context:
{external_context}

Provide:
1. Optimal discount placement strategy
2. Recommended campaign type
3. Margin risk level (Low/Medium/High)
4. Pricing intensity (Heavy / Moderate / Light / No discount)
5. 2 upsell/cross-sell ideas
6. Risk of over-discounting or churn

Respond in structured bullet format.
"""

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 600
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    result = response.json()

    try:
        content = result["choices"][0]["message"]["content"]
        content = content.strip()

        if content.startswith("```"):
            content = content.split("```")[1]

        parsed_json = json.loads(content)
        validated = StrategyOutput(**parsed_json)

        return validated.dict()

    except Exception as e:
        return {
            "error": "AI output validation failed",
            "details": str(e),
            "raw_response": result
    }
