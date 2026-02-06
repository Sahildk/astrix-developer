import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://api-inference.huggingface.co/models/valhalla/distilbart-mnli-12-1"
headers = {"Authorization": f"Bearer {os.getenv('HF_TOKEN')}"}

LABELS = [
    "Safety",
    "Maintenance",
    "Harassment",
    "Discrimination"
]

def keyword_fallback(text: str):
    text = text.lower()
    if any(x in text for x in ["rent", "deposit", "money", "cost", "pay", "increase", "expensive", "fee"]):
        return "Unfair Rent"
    if any(x in text for x in ["abuse", "rude", "yell", "hurt", "threat", "call", "manager", "harass", "shout", "scream", "stalk"]):
        return "Harassment"
    if any(x in text for x in ["race", "gender", "religion", "color","caste", "bias", "exclude", "minority", "gay", "trans"]):
        return "Discrimination"
    if any(x in text for x in ["leak", "broken", "repair", "fix", "water", "mold", "rat", "bug", "roach", "heat", "cold", "plumber", "electric"]):
        return "Maintenance"
    if any(x in text for x in ["fire", "lock", "steal", "break", "danger", "thief", "security", "intruder", "gun", "weapon"]):
        return "Safety"
    return "Maintenance"

def classify_issue(text: str):
    # 1. Try AI API
    payload = {
        "inputs": text,
        "parameters": {"candidate_labels": LABELS}
    }
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=2) # Short timeout
        response.raise_for_status()
        output = response.json()
        
        return {
            "category": output["labels"][0],
            "confidence": output["scores"][0]
        }
    except Exception:
        # Silently failover to keyword matcher
        print(f"       [Info] Offline Mode: Using Keyword Matcher for '{text[:20]}...'")
        category = keyword_fallback(text)
        return {
            "category": category,
            "confidence": 0.85 
        }
