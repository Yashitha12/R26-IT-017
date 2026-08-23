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


# =========================================================
# FLASK SETUP
# =========================================================

app = Flask(__name__)

CORS(app)


# =========================================================
# LOAD EMBEDDING MODEL
# =========================================================

print("Loading embedding model...")

embedding_model = SentenceTransformer(
    'all-MiniLM-L6-v2'
)

print("Embedding model loaded.")


# =========================================================
# LOAD FAISS INDEX
# =========================================================

print("Loading FAISS index...")

index = faiss.read_index(
    'rag/faiss_index.bin'
)

print("FAISS index loaded.")


# =========================================================
# LOAD KNOWLEDGE BASE DOCUMENTS
# =========================================================

print("Loading knowledge base...")

with open(
    'rag/documents.pkl',
    'rb'
) as f:

    documents = pickle.load(f)

print(
    f"Loaded {len(documents)} knowledge-base documents."
)


# =========================================================
# SINHALA LANGUAGE DETECTION
# =========================================================

def is_sinhala(text):

    for char in text:

        if '\u0D80' <= char <= '\u0DFF':

            return True

    return False


# =========================================================
# RAG RETRIEVAL
# =========================================================

def retrieve_context(query, k=3):

    # -----------------------------------
    # Convert query into embedding
    # -----------------------------------

    query_embedding = embedding_model.encode(
        [query]
    )

    # -----------------------------------
    # Search FAISS
    # -----------------------------------

    distances, indices = index.search(
        np.array(query_embedding),
        k
    )

    # -----------------------------------
    # Collect documents
    # -----------------------------------

    retrieved_docs = []

    for idx in indices[0]:

        if idx < len(documents):

            retrieved_docs.append(
                documents[idx]
            )

    # -----------------------------------
    # Return combined context
    # -----------------------------------

    return "\n\n".join(
        retrieved_docs
    )


# =========================================================
# PERSONAL QUESTION DETECTION
# =========================================================

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


# =========================================================
# CLEAN AI RESPONSE
# =========================================================

def clean_response(reply):

    # -----------------------------------
    # Remove unwanted phrases
    # -----------------------------------

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

    # -----------------------------------
    # Remove section titles
    # -----------------------------------

    reply = re.sub(
        r'^[A-Z\s]+:\s*',
        '',
        reply
    )

    # -----------------------------------
    # Remove extra spaces
    # -----------------------------------

    reply = re.sub(
        r'\s+',
        ' ',
        reply
    ).strip()

    # -----------------------------------
    # Capitalize first letter
    # -----------------------------------

    if reply:

        reply = (
            reply[0].upper()
            + reply[1:]
        )

    # -----------------------------------
    # Add period
    # -----------------------------------

    if reply and not reply.endswith(
        (".", "!", "?")
    ):

        reply += "."

    return reply


# =========================================================
# GENERATE HUMAN-FRIENDLY RESPONSE
# =========================================================

def generate_human_response(
    context,
    question
):

    prompt = f"""
You are the SmartGrama AI Assistant.

Your job is to answer questions about the SmartGrama welfare and
micro-loan system.

Use ONLY the information provided in the SmartGrama Information section.

Do NOT use outside knowledge.

SmartGrama Information:
{context}

User Question:
{question}

Instructions:

1. Answer the user's question directly.
2. Use only information found in the provided SmartGrama Information.
3. Do not invent facts.
4. Do not mention "context", "retrieved information", or RAG.
5. Do not say that information is unavailable if the answer exists in the provided information.
6. Keep the answer natural and conversational.
7. Keep the answer short.
8. Maximum 3 sentences.
9. If the question is about loan eligibility, use the loan information.
10. If the question asks about high monthly expenses, explain that the system may recommend a smaller loan amount.
11. Do not give personal account information.

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

            "temperature": 0.2,

            "num_predict": 100

        }

    )

    return response[
        'message'
    ][
        'content'
    ]


# =========================================================
# MAIN NLP PROCESSING
# =========================================================

def process_text(user_message):

    # -----------------------------------
    # Empty input
    # -----------------------------------

    if not user_message.strip():

        return {
            "reply": "Please enter a message."
        }


    # =====================================================
    # PERSONAL QUESTION CHECK
    # =====================================================

    if is_personal_question(
        user_message
    ):

        return {

            "reply":
            "I cannot access personal account information yet."

        }


    # =====================================================
    # LANGUAGE DETECTION
    # =====================================================

    sinhala = False

    if is_sinhala(
        user_message
    ):

        sinhala = True

        print(
            "Sinhala question detected."
        )

        # -----------------------------------
        # Translate Sinhala → English
        # -----------------------------------

        try:

            translated = GoogleTranslator(

                source='auto',

                target='en'

            ).translate(
                user_message
            )

            print(
                "Translated question:"
            )

            print(
                translated
            )

        except Exception as e:

            print(
                "Translation error:"
            )

            print(e)

            translated = user_message

    else:

        translated = user_message


    # =====================================================
    # RAG RETRIEVAL
    # =====================================================

    retrieved_context = retrieve_context(

        translated,

        k=3

    )


    # =====================================================
    # RAG DEBUG INFORMATION
    # =====================================================

    print()
    print(
        "============================================"
    )

    print(
        "              RAG DEBUG INFO"
    )

    print(
        "============================================"
    )

    print(
        "USER QUESTION:"
    )

    print(
        translated
    )

    print(
        "--------------------------------------------"
    )

    print(
        "RETRIEVED CONTEXT:"
    )

    print(
        retrieved_context
    )

    print(
        "--------------------------------------------"
    )

    print(
        "NUMBER OF DOCUMENTS RETRIEVED:"
    )

    print(
        len(
            retrieved_context.split(
                "\n\n"
            )
        )
    )

    print(
        "============================================"
    )

    print()


    # =====================================================
    # NO CONTEXT
    # =====================================================

    if not retrieved_context.strip():

        response = {

            "reply":
            "I do not have enough information to answer that."

        }

        return response


    # =====================================================
    # GENERATE RESPONSE
    # =====================================================

    try:

        reply = generate_human_response(

            retrieved_context,

            translated

        )

    except Exception as e:

        print(
            "Ollama error:"
        )

        print(e)

        return {

            "reply":
            f"Model error: {str(e)}"

        }


    # =====================================================
    # CLEAN RESPONSE
    # =====================================================

    reply = clean_response(
        reply
    )


    # =====================================================
    # TRANSLATE ENGLISH → SINHALA
    # =====================================================

    if sinhala:

        try:

            reply = GoogleTranslator(

                source='en',

                target='si'

            ).translate(
                reply
            )

        except Exception as e:

            print(
                "Sinhala translation error:"
            )

            print(e)


    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        "reply": reply

    }


# =========================================================
# CHAT API
# =========================================================

@app.route(
    '/chat',
    methods=['POST']
)
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

        return jsonify(
            response
        )

    except Exception as e:

        print(
            "Server error:"
        )

        print(e)

        return jsonify({

            "reply":
            f"Server error: {str(e)}"

        })


# =========================================================
# HOME ROUTE
# =========================================================

@app.route('/')
def home():

    return (
        "SmartGrama AI Backend Running"
    )


# =========================================================
# RUN FLASK SERVER
# =========================================================

if __name__ == '__main__':

    print()
    print(
        "============================================"
    )

    print(
        "     SmartGrama AI Backend Starting"
    )

    print(
        "============================================"
    )

    print(
        "Backend:"
    )

    print(
        "http://127.0.0.1:5000"
    )

    print()

    app.run(

        debug=True,

        host='0.0.0.0',

        port=5000

    )