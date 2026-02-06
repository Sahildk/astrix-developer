
import os
import sys
from dotenv import load_dotenv
from classifier import classify_issue

# Force reload of environment variables
load_dotenv(override=True)

print("Testing Classifier with updated permissions...")

# Test case
text = "The landlord refuses to fix the broken heater and it is freezing inside."
print(f"Input: {text}")

try:
    result = classify_issue(text)
    print("Result:", result)
    if result.get("source") == "AI_API":
        print("\n✅ SUCCESS: Classification performed via Online API!")
    else:
        print("\n❌ FAILURE: Still falling back to local/default mode.")
        print("Please check if the 'Make calls to Inference Providers' permission is saved.")
        sys.exit(1)
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    sys.exit(1)
