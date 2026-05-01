from flask import Flask, request, jsonify
import subprocess
from deep_translator import GoogleTranslator
import re

app = Flask(__name__)

# Detect Sinhala text
def is_sinhala(text):
    for char in text:
        if '\u0D80' <= char <= '\u0DFF':
            return True
    return False

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']

    # Step 1 — Sinhala → English
    if is_sinhala(user_message):
        try:
            translated = GoogleTranslator(source='auto', target='en').translate(user_message)
            model_input = f"Explain in one short sentence using very simple English. Use only common words:\n{translated}"
            sinhala = True
        except:
            model_input = f"Explain in one short sentence using very simple English:\n{user_message}"
            sinhala = True
    else:
        model_input = f"Explain in one short sentence using very simple English. Use only common words:\n{user_message}"
        sinhala = False

    # Step 2 — Run TinyLLaMA
    result = subprocess.run(
        'ollama run tinyllama',
        input=model_input,
        text=True,
        capture_output=True,
        shell=True
    )

    reply = result.stdout.strip()

    # Step 3 — STRONG CLEANING

    # Remove unicode junk
    reply = reply.replace("\\u200d", "")

    # Remove patterns like [[K
    reply = re.sub(r'\[\[.*?\]\]', '', reply)

    # Remove patterns like 7D, 9D
    reply = re.sub(r'\b\d+[A-Z]\b', '', reply)

    # Remove broken words ending with K (teK, intelK)
    reply = re.sub(r'\b\w*K\b', '', reply)

    # Remove very short garbage words
    reply = re.sub(r'\b\w{1,2}\b', '', reply)

    # Remove unwanted symbols
    reply = re.sub(r'[^\w\s.,]', '', reply)

    # Clean spaces
    reply = re.sub(r'\s+', ' ', reply).strip()

    # Step 4 — English → Sinhala
    if sinhala:
        try:
            reply = GoogleTranslator(source='en', target='si').translate(reply)
        except:
            pass

    return jsonify({"reply": reply})


if __name__ == '__main__':
    app.run(debug=True)