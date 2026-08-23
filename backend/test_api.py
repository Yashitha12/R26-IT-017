import requests
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:5000"

def test():
    print("1. Testing /status endpoint:")
    r = requests.get(f"{BASE_URL}/status")
    print(r.json())

    print("\n2. Testing /chat with English query:")
    payload = {
        "message": "What welfare assistance is available?",
        "language": "en-US",
        "use_rag": True
    }
    r = requests.post(f"{BASE_URL}/chat", json=payload, timeout=30)
    print("Response:", r.json())

    print("\n3. Testing /chat with Sinhala query:")
    payload_si = {
        "message": "මට ණයක් ලබාගන්න පුළුවන්ද?",
        "language": "si-LK",
        "use_rag": True
    }
    r_si = requests.post(f"{BASE_URL}/chat", json=payload_si, timeout=30)
    print("Response (Sinhala):", r_si.json())

    print("\n4. Testing /chat with Personal query guardrail:")
    payload_personal = {
        "message": "What is my loan balance?",
        "language": "en-US",
        "use_rag": True
    }
    r_pers = requests.post(f"{BASE_URL}/chat", json=payload_personal, timeout=30)
    print("Response (Personal Guardrail):", r_pers.json())

    print("\n5. Testing /chat with Baseline (No RAG):")
    payload_baseline = {
        "message": "How to apply for a loan in SmartGrama?",
        "language": "en-US",
        "use_rag": False
    }
    r_base = requests.post(f"{BASE_URL}/chat", json=payload_baseline, timeout=30)
    print("Response (Baseline):", r_base.json())

    print("\n6. Testing /chat with Out-of-Scope query:")
    payload_oos = {
        "message": "What is the recipe for chocolate chip cookies?",
        "language": "en-US",
        "use_rag": True
    }
    r_oos = requests.post(f"{BASE_URL}/chat", json=payload_oos, timeout=30)
    print("Response (Out of Scope):", r_oos.json())

if __name__ == '__main__':
    test()
