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
# Retrieve Context
# -----------------------------------
def retrieve_context(query, k=1):

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

    return "\n".join(retrieved_docs)


# -----------------------------------
# Personal Question Detection
# -----------------------------------
def is_personal_question(text):

    personal_keywords = [

        "my loan",
        "my payment",
        "my wallet",
        "my account",
        "my balance",
        "my welfare",
        "my eligibility",
        "my risk",
        "my status",
        "my application",
        "next payment",
        "my amount"

    ]

    text = text.lower()

    for keyword in personal_keywords:

        if keyword in text:

            return True

    return False


# -----------------------------------
# Clean AI Response
# -----------------------------------
def clean_response(reply):

    # Remove unwanted phrases
    junk_phrases = [

        "Answer:",
        "Response:",
        "Final Answer:",
        "Here is the answer",
        "Here’s the answer",
        "According to the context",
        "According to the information",
        "SmartGrama information",
        "Retrieved information"

    ]

    for phrase in junk_phrases:

        reply = reply.replace(
            phrase,
            ""
        )

    # Remove section titles
    reply = re.sub(
        r'^[A-Z\s]+:\s*',
        '',
        reply
    )

    # Remove extra spaces
    reply = re.sub(
        r'\s+',
        ' ',
        reply
    ).strip()

    # Capitalize first letter
    if reply:

        reply = reply[0].upper() + reply[1:]

    # Add final period
    if reply and not reply.endswith("."):

        reply += "."

    return reply


# -----------------------------------
# Generate Human-Friendly Response
# -----------------------------------
def generate_human_response(context, question):

    prompt = f"""
You are the SmartGrama AI Assistant.

Use ONLY the information below to answer the user's question.

SmartGrama Information:
{context}

User Question:
{question}

Instructions:
- Answer naturally and conversationally.
- Keep the answer accurate.
- Do not invent new information.
- Keep it short and helpful.
- Sound like a friendly assistant.
- Maximum 3 sentences.

Friendly Answer:
"""

    response = ollama.chat(

        model='gemma:2b',

        messages=[
            {
                'role': 'user',
                'content': prompt
            }
        ],

        options={
            "temperature": 0.3,
            "num_predict": 80
        }
    )

    return response['message']['content']


# -----------------------------------
# Main NLP Processing
# -----------------------------------
def process_text(user_message):

    # Empty Input
    if not user_message.strip():

        return {
            "reply": "Please enter a message."
        }

    # -----------------------------------
    # Block Personal Questions
    # -----------------------------------
    if is_personal_question(user_message):

        return {
            "reply": "I cannot access personal account information yet."
        }

    # -----------------------------------
    # Detect Sinhala
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
    # Retrieve RAG Context
    # -----------------------------------
    retrieved_context = retrieve_context(
        translated
    )

    # -----------------------------------
    # No Context
    # -----------------------------------
    if not retrieved_context.strip():

        return {
            "reply": "I do not have enough information to answer that."
        }

    # -----------------------------------
    # Generate Human Response
    # -----------------------------------
    try:

        reply = generate_human_response(
            retrieved_context,
            translated
        )

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

    # -----------------------------------
    # Final Response
    # -----------------------------------
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