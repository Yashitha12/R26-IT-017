# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify
from flask_cors import CORS

import ollama
import re

# -----------------------------------
# Translation
# -----------------------------------
from deep_translator import GoogleTranslator

# -----------------------------------
# RAG Imports
# -----------------------------------
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle

# -----------------------------------
# Flask Setup
# -----------------------------------
app = Flask(__name__)

CORS(app)

# -----------------------------------
# Load Embedding Model
# -----------------------------------
embedding_model = SentenceTransformer(
    'all-MiniLM-L6-v2'
)

# -----------------------------------
# Load FAISS Index
# -----------------------------------
index = faiss.read_index(
    'rag/faiss_index.bin'
)

# -----------------------------------
# Load Documents
# -----------------------------------
with open('rag/documents.pkl', 'rb') as f:

    documents = pickle.load(f)

# -----------------------------------
# Detect Sinhala Text
# -----------------------------------
def is_sinhala(text):

    for char in text:

        if '\u0D80' <= char <= '\u0DFF':

            return True

    return False


# -----------------------------------
# Retrieve Relevant Context
# -----------------------------------
def retrieve_context(query, k=2):

    query_embedding = embedding_model.encode([query])

    distances, indices = index.search(
        np.array(query_embedding),
        k
    )

    retrieved_docs = []

    for idx in indices[0]:

        if idx < len(documents):

            retrieved_docs.append(
                documents[idx]
            )

    return "\n".join(retrieved_docs[:2])


# -----------------------------------
# Clean AI Response
# -----------------------------------
def clean_response(reply):

    # Remove unwanted phrases
    junk_phrases = [

        "Final Answer:",
        "Answer:",
        "Possible final answer:",
        "possible final answer",
        "Sure,",
        "heres",
        "here is",
        "using SmartGrama knowledge",
        "SmartGrama knowledge",
        "The context states",
        "The information states",
        "According to the context",
        "According to the information",
        "SmartGrama AI Assistant",
        "retrieved knowledge",
        "Reply:",
        "Response:",
        "Questions",
        "Question"

    ]

    for phrase in junk_phrases:

        reply = reply.replace(
            phrase,
            ""
        )

    # Remove repeated question patterns
    reply = re.sub(
        r'how do i .*?\?',
        '',
        reply,
        flags=re.IGNORECASE
    )

    # Remove weird characters
    reply = reply.replace(
        "\\u200d",
        ""
    )

    # Remove brackets
    reply = re.sub(
        r'\[\[.*?\]\]',
        '',
        reply
    )

    # Keep Sinhala + English characters
    reply = re.sub(
        r'[^\w\s.,!?඀-෿]',
        '',
        reply
    )

    # Remove extra spaces
    reply = re.sub(
        r'\s+',
        ' ',
        reply
    ).strip()

    # Remove duplicate words
    words = reply.split()

    cleaned_words = []

    for i, word in enumerate(words):

        if i == 0 or word.lower() != words[i - 1].lower():

            cleaned_words.append(word)

    reply = " ".join(cleaned_words)

    # Keep only first 2 sentences
    sentences = re.split(
        r'(?<=[.!?])\s+',
        reply
    )

    reply = " ".join(
        sentences[:2]
    ).strip()

    # Capitalize first letter
    reply = reply.capitalize()

    # Final fallback
    if not reply:

        reply = "I do not have enough information."

    return reply


# -----------------------------------
# Main NLP Processing
# -----------------------------------
def process_text(user_message):

    # Empty Input Check
    if not user_message or user_message.strip() == "":

        return {
            "reply": "No input detected."
        }

    # -----------------------------------
    # Sinhala Detection + Translation
    # -----------------------------------
    sinhala = False

    if is_sinhala(user_message):

        sinhala = True

        try:

            translated = GoogleTranslator(
                source='auto',
                target='en'
            ).translate(user_message)

        except:

            translated = user_message

    else:

        translated = user_message

    # -----------------------------------
    # Retrieve Context
    # -----------------------------------
    retrieved_context = retrieve_context(
        translated
    )

    # -----------------------------------
    # No Context Fallback
    # -----------------------------------
    if not retrieved_context.strip():

        return {
            "reply": "I do not have enough information."
        }

    # -----------------------------------
    # Prompt Engineering
    # -----------------------------------
    model_input = f"""
Answer the question using ONLY this SmartGrama data.

Data:
{retrieved_context}

Question:
{translated}

Answer in ONE short sentence only.
Do NOT repeat the question.
Do NOT explain.
"""

    # -----------------------------------
    # Run PHI Model
    # -----------------------------------
    try:

        response = ollama.chat(
    model='phi',
    messages=[
        {
            'role': 'user',
            'content': model_input
        }
    ],
    options={
        "num_predict": 40,
        "temperature": 0.2
    }
)

        reply = response['message']['content']

    except Exception as e:

        return {
            "reply": f"Model error: {str(e)}"
        }

    # -----------------------------------
    # Clean Response
    # -----------------------------------
    reply = clean_response(reply)

    # -----------------------------------
    # Translate Back to Sinhala
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
# Chat Route
# -----------------------------------
@app.route('/chat', methods=['POST'])
def chat():

    try:

        data = request.get_json()

        user_message = data.get(
            'message',
            ''
        )

        response = process_text(
            user_message
        )

        return jsonify(response)

    except Exception as e:

        return jsonify({
            "reply": f"Server error: {str(e)}"
        })


# -----------------------------------
# Home Route
# -----------------------------------
@app.route('/')
def home():

    return "SmartGrama AI Backend Running"


# -----------------------------------
# Run Flask App
# -----------------------------------
if __name__ == '__main__':

    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )