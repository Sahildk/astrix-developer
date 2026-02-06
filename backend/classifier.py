import os
import time
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

# Initialize Client
hf_token = os.getenv('HF_TOKEN')
if hf_token:
    hf_token = hf_token.strip()

# We can specify the model directly in the client
# facebook/bart-large-mnli is a solid default for zero-shot
repo_id = "valhalla/distilbart-mnli-12-1"
client = InferenceClient(token=hf_token)

LABELS = [
    "Safety",
    "Maintenance",
    "Harassment",
    "Discrimination"
]

def classify_issue(text: str):
    """
    Classifies the issue using Hugging Face Inference API via InferenceClient.
    Ensures online execution.
    """
    max_retries = 5
    for attempt in range(max_retries):
        try:
            print(f"Assigning AI for classification (Attempt {attempt + 1}/{max_retries})...")
            
            # Using the official client method
            output = client.zero_shot_classification(
                text,
                LABELS,
                model=repo_id
            )
            
            # The output seems to be a list of custom objects (ZeroShotClassificationOutputElement)
            # Example: [ZeroShotClassificationOutputElement(label='Harassment', score=0.4...), ...]
            
            # Find the element with the highest score
            best_match = max(output, key=lambda x: x.score)
            
            return {
                "category": best_match.label,
                "confidence": best_match.score,
                "source": "AI_API"
            }

        except Exception as e:
            error_str = str(e).lower()
            print(f"API Error: {e}")
            
            # Check for model loading
            if "loading" in error_str or "503" in error_str:
                print("Model is loading or unavailable, waiting 5s...")
                time.sleep(5)
                continue
            
            if attempt < max_retries - 1:
                time.sleep(2)
            else:
                pass
                
    # Fallback only if strictly necessary
    return {
        "category": "Maintenance", 
        "confidence": 0.0,
        "source": "Fallback" 
    }
