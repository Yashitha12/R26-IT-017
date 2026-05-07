# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
from deep_translator import GoogleTranslator
import speech_recognition as sr
import re
import os

app = Flask(__name__)
CORS(app)

# -----------------------------------
# Detect Sinhala Text
# -----------------------------------
def is_sinhala(text):

    for char in text:

        if '\u0D80' <= char <= '\u0DFF':
            return True

    return False


# -----------------------------------
# Speech to Text Function
# -----------------------------------
def speech_to_text(audio_file):

    recognizer = sr.Recognizer()

    with sr.AudioFile(audio_file) as source:

        audio = recognizer.record(source)

    try:

        text = recognizer.recognize_google(audio)

        return text

    except:

        return ""


# -----------------------------------
# Main NLP Processing Function
# -----------------------------------
def process_text(user_message):

    if not user_message or user_message.strip() == "":

        return {
            "reply": "No input detected."
        }

    # -----------------------------------
    # Sinhala → English Translation
    # -----------------------------------
    if is_sinhala(user_message):

        try:

            translated = GoogleTranslator(
                source='auto',
                target='en'
            ).translate(user_message)

            sinhala = True

        except:

            translated = user_message
            sinhala = True

    else:

        translated = user_message
        sinhala = False

    # -----------------------------------
    # TinyLLaMA Prompt
    # -----------------------------------
    model_input = f"""
You are a financial and welfare assistant.

Rules:
- Give ONLY the final answer.
- Use ONE short sentence.
- Do NOT explain.
- Do NOT repeat the question.
- Do NOT give examples.
- Do NOT repeat words.

Only answer questions about:
- loans
- welfare
- subsidies
- government benefits
- financial help

If unrelated, say:
"I can only help with financial or welfare questions."

Question: {translated}

Final short answer:
"""

    # -----------------------------------
    # Run TinyLLaMA
    # -----------------------------------
    result = subprocess.run(
        'ollama run tinyllama',
        input=model_input,
        text=True,
        capture_output=True,
        shell=True
    )

    reply = result.stdout.strip()

    # -----------------------------------
    # Extract answer only
    # -----------------------------------
    if "Final short answer:" in reply:

        reply = reply.split("Final short answer:")[-1].strip()

    # -----------------------------------
    # CLEANING
    # -----------------------------------

    # Remove unicode junk
    reply = reply.replace("\\u200d", "")

    # Remove [[K junk
    reply = re.sub(r'\[\[.*?\]\]', '', reply)

    # Remove weird short junk
    reply = re.sub(r'\b\d+[A-Z]\b', '', reply)

    # Remove weird K endings
    reply = re.sub(r'\b\w*K\b', '', reply)

    # Remove unwanted symbols
    reply = re.sub(r'[^\w\s.,]', '', reply)

    # Remove extra spaces
    reply = re.sub(r'\s+', ' ', reply).strip()

    # -----------------------------------
    # Remove duplicate consecutive words
    # -----------------------------------
    words = reply.split()

    cleaned_words = []

    for i, word in enumerate(words):

        if i == 0 or word.lower() != words[i - 1].lower():

            cleaned_words.append(word)

    reply = " ".join(cleaned_words)

    # -----------------------------------
    # Keep only first sentence
    # -----------------------------------
    reply = reply.split(".")[0] + "."

    # -----------------------------------
    # English → Sinhala Translation
    # -----------------------------------
    if sinhala:

        try:

            reply = GoogleTranslator(
                source='en',
                target='si'
            ).translate(reply)

        except:
            pass

    return {
        "reply": reply
    }


# -----------------------------------
# TEXT CHAT ROUTE
# -----------------------------------
@app.route('/chat', methods=['POST'])
def chat():

    data = request.get_json()

    user_message = data.get('message', '')

    response = process_text(user_message)

    return jsonify(response)


# -----------------------------------
# AUDIO CHAT ROUTE
# -----------------------------------
@app.route('/chat/audio', methods=['POST'])
def chat_audio():

    if 'audio' not in request.files:

        return jsonify({
            "reply": "No audio uploaded."
        })

    file = request.files['audio']

    # Create uploads folder automatically
    os.makedirs("uploads", exist_ok=True)

    file_path = "uploads/temp_audio.wav"

    file.save(file_path)

    text = speech_to_text(file_path)

    if text == "":

        return jsonify({
            "reply": "Could not understand audio."
        })

    response = process_text(text)

    return jsonify(response)


# -----------------------------------
# RUN APP
# -----------------------------------
if __name__ == '__main__':

    app.run(debug=True)