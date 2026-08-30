# -*- coding: utf-8 -*-

import sys
import os

# Enforce UTF-8 on Windows console stdout/stderr
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
from gtts import gTTS

import ollama
import re

# -----------------------------------
# Translation
# -----------------------------------
from mtranslate import translate as m_translate

# -----------------------------------
# RAG Imports
# -----------------------------------
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle


# =========================================================
# GLOSSARY PRESERVATION
# =========================================================

SINHALA_TERMS = {
    "Aswesuma": "අස්වැසුම",
    "Samurdhi": "සමෘද්ධි",
    "Grama Niladhari": "ග්‍රාම නිලධාරී",
    "SmartGrama": "SmartGrama"
}

ENGLISH_TERMS = {
    "අස්වැසුම": "Aswesuma",
    "සමෘද්ධි": "Samurdhi",
    "ග්‍රාම නිලධාරී": "Grama Niladhari",
    "ග්‍රාම නිලධාරි": "Grama Niladhari",
    "ස්මාර්ට්ග්‍රාම": "SmartGrama"
}

def translate_to_sinhala_with_glossary(text):
    if not text:
        return text
    placeholders = {}
    for i, (en_term, si_term) in enumerate(SINHALA_TERMS.items()):
        placeholder = f" XX{i}XX "
        pattern = re.compile(r'\b' + re.escape(en_term) + r'\b', re.IGNORECASE)
        if pattern.search(text):
            placeholders[placeholder.strip()] = si_term
            text = pattern.sub(placeholder, text)
            
    translated = m_translate(text, "si", "en")
    
    for placeholder, si_term in placeholders.items():
        translated = translated.replace(placeholder, si_term)
        
    return translated

def translate_to_english_with_glossary(text):
    if not text:
        return text
    placeholders = {}
    for i, (si_term, en_term) in enumerate(ENGLISH_TERMS.items()):
        placeholder = f" YY{i}YY "
        if si_term in text:
            placeholders[placeholder.strip()] = en_term
            text = text.replace(si_term, placeholder)
            
    translated = m_translate(text, "en", "auto")
    
    for placeholder, en_term in placeholders.items():
        translated = translated.replace(placeholder, en_term)
        
    return translated

# =========================================================
# FLASK SETUP
# =========================================================

app = Flask(__name__)
CORS(app)


# =========================================================
# LOAD EMBEDDING MODEL
# =========================================================

print("Loading embedding model...")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Embedding model loaded.")


# =========================================================
# LOAD FAISS INDEX & KNOWLEDGE BASE
# =========================================================

def load_rag_data():
    global index, documents
    index_path = 'rag/faiss_index.bin'
    docs_path = 'rag/documents.pkl'

    if not os.path.exists(index_path) or not os.path.exists(docs_path):
        print("Warning: RAG index or documents not found. Please run create_embeddings.py first.")
        index = None
        documents = []
        return

    print("Loading FAISS index...")
    index = faiss.read_index(index_path)
    print("FAISS index loaded.")

    print("Loading knowledge base...")
    with open(docs_path, 'rb') as f:
        documents = pickle.load(f)
    print(f"Loaded {len(documents)} knowledge-base documents.")

load_rag_data()


# =========================================================
# SINHALA LANGUAGE DETECTION
# =========================================================

def is_sinhala(text):
    for char in text:
        if '\u0D80' <= char <= '\u0DFF':
            return True
    return False


# =========================================================
# RAG RETRIEVAL WITH SIMILARITY THRESHOLD
# =========================================================

def retrieve_context(query, k=3):
    if index is None or len(documents) == 0:
        return "", 999.0

    # -----------------------------------
    # Convert query into embedding
    # -----------------------------------
    query_embedding = embedding_model.encode([query])

    # -----------------------------------
    # Search FAISS
    # -----------------------------------
    distances, indices = index.search(np.array(query_embedding), k)

    min_distance = float(distances[0][0]) if len(distances[0]) > 0 else 999.0

    # -----------------------------------
    # Collect documents
    # -----------------------------------
    retrieved_docs = []
    for idx in indices[0]:
        if 0 <= idx < len(documents):
            retrieved_docs.append(documents[idx])

    return "\n\n".join(retrieved_docs), min_distance


# =========================================================
# PERSONAL QUESTION DETECTION (PRIVACY GUARDRAIL)
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
        "my amount",
        "my nic",
        "මගේ ණය",
        "මගේ ගිණුම",
        "මගේ ශේෂය",
        "මගේ සුබසාධන"
    ]

    text_lower = text.lower()
    for keyword in personal_keywords:
        if keyword in text_lower:
            return True
    return False


# =========================================================
# CLEAN AI RESPONSE
# =========================================================

def clean_response(reply):
    # Remove generic chat preambles often generated by small models (e.g. "Sure, here's a friendly answer:")
    reply = re.sub(r"^(Sure|Here|Yes)[,\s]*(here's|here is|this is|we have).*?:\s*", "", reply, flags=re.IGNORECASE)
    
    junk_phrases = [
        "Friendly Answer:",
        "Answer:",
        "Response:",
        "Final Answer:",
        "According to the context",
        "According to the information provided",
        "According to the information",
        "SmartGrama information",
        "Retrieved information:"
    ]

    for phrase in junk_phrases:
        reply = reply.replace(phrase, "")

    # Remove markdown leading titles or colons
    reply = re.sub(r'^[A-Z\s]+:\s*', '', reply)

    # Normalize horizontal whitespace but preserve newlines
    reply = re.sub(r'[ \t]+', ' ', reply).strip()

    # Capitalize first letter
    if reply:
        reply = reply[0].upper() + reply[1:]

    # Add terminal punctuation if missing
    if reply and not reply.endswith((".", "!", "?")):
        reply += "."

    return reply


# =========================================================
# GENERATE HUMAN-FRIENDLY RESPONSE (RAG OR BASELINE)
# =========================================================

def generate_human_response(context, question, use_rag=True):
    if use_rag and context:
        prompt = f"""You are the SmartGrama AI Assistant. Use ONLY the following information to answer the question.
Provide your answer using short bullet points for easy reading. Keep it very brief and factual.

Information:
{context}

Question:
{question}

Answer (in bullet points):
"""
    else:
        # Baseline model without RAG context (for research comparison)
        prompt = f"""You are the SmartGrama AI Assistant. Please answer the user's question concisely using short bullet points.
User Question:
{question}

Answer (in bullet points):
"""

    model_name = 'tinyllama:latest'
    try:
        response = ollama.chat(
            model=model_name,
            messages=[{'role': 'user', 'content': prompt}],
            options={
                "temperature": 0.2,
                "num_predict": 300
            }
        )
    except Exception as e:
        print(f"{model_name} error: {e}, falling back to gemma:2b...")
        response = ollama.chat(
            model='gemma:2b',
            messages=[{'role': 'user', 'content': prompt}],
            options={
                "temperature": 0.2,
                "num_predict": 300
            }
        )

    return response['message']['content']


# =========================================================
# MAIN NLP & RAG PROCESSING PIPELINE
# =========================================================

def process_text(user_message, selected_lang="en-US", use_rag=True):
    # 1. Empty input check
    if not user_message or not user_message.strip():
        if selected_lang == "si-LK":
            return {"reply": "කරුණාකර ඔබගේ ප්‍රශ්නය ඇතුළත් කරන්න.", "language": selected_lang, "rag_used": use_rag}
        return {"reply": "Please enter a message.", "language": selected_lang, "rag_used": use_rag}

    # 2. Personal Question Guardrail
    if is_personal_question(user_message):
        if selected_lang == "si-LK" or is_sinhala(user_message):
            return {
                "reply": "ආරක්ෂක හේතු මත මට ඔබගේ පුද්ගලික ගිණුම් හෝ ණය තොරතුරු වෙත සෘජුවම ප්‍රවේශ විය නොහැක. කරුණාකර ඔබගේ SmartGrama Dashboard හෝ Wallet එක පරීක්ෂා කරන්න.",
                "language": selected_lang,
                "rag_used": use_rag
            }
        return {
            "reply": "For security and privacy, I cannot access personal account details directly. Please check your SmartGrama Dashboard or Wallet.",
            "language": selected_lang,
            "rag_used": use_rag
        }

    # 3. Multilingual Detection & Translation
    sinhala_mode = (selected_lang == "si-LK") or is_sinhala(user_message)
    translated_query = user_message

    if sinhala_mode:
        print(f"[Sinhala detected] Input: {user_message}")
        try:
            translated_query = translate_to_english_with_glossary(user_message)
            print(f"[Translated to English]: {translated_query}")
        except Exception as e:
            print(f"Sinhala -> English translation error: {e}")
            translated_query = user_message

    # 4. RAG Retrieval (if enabled)
    retrieved_context = ""
    min_dist = 0.0

    if use_rag:
        retrieved_context, min_dist = retrieve_context(translated_query, k=3)

        print("\n============================================")
        print("              RAG DEBUG INFO")
        print("============================================")
        print(f"QUERY: {translated_query}")
        print(f"MIN DISTANCE: {min_dist:.4f}")
        print(f"RETRIEVED CONTEXT:\n{retrieved_context}")
        print("============================================\n")

        # Out-of-Domain Filter: If distance is too high, question is unrelated
        if min_dist > 1.45 and not retrieved_context.strip():
            fallback = "I am specifically designed to provide assistance with SmartGrama welfare schemes, micro-loans, eligibility, and profile guidelines. I do not have information on this topic."
            if sinhala_mode:
                try:
                    fallback = translate_to_sinhala_with_glossary(fallback)
                except Exception:
                    pass
            return {"reply": fallback, "language": selected_lang, "rag_used": use_rag}

    # 5. Response Generation via LLM
    try:
        raw_reply = generate_human_response(retrieved_context, translated_query, use_rag=use_rag)
    except Exception as e:
        print(f"LLM Generation error: {e}")
        return {
            "reply": f"Model inference error: {str(e)}",
            "language": selected_lang,
            "rag_used": use_rag
        }

    # 6. Clean Response
    reply = clean_response(raw_reply)

    if sinhala_mode:
        try:
            reply = translate_to_sinhala_with_glossary(reply)
        except Exception as e:
            print(f"English -> Sinhala translation error: {e}")

    return {
        "reply": reply,
        "language": selected_lang,
        "rag_used": use_rag
    }


# =========================================================
# CHAT API ENDPOINT
# =========================================================

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json() or {}
        user_message = data.get('message', '')
        selected_lang = data.get('language', 'en-US')
        use_rag = data.get('use_rag', True)

        response = process_text(
            user_message=user_message,
            selected_lang=selected_lang,
            use_rag=use_rag
        )

        return jsonify(response)

    except Exception as e:
        print(f"Server error in /chat: {e}")
        return jsonify({
            "reply": f"Server error: {str(e)}",
            "language": "en-US",
            "rag_used": True
        }), 500


# =========================================================
# TEXT-TO-SPEECH (TTS) CLEANER & API ENDPOINT
# =========================================================

def clean_text_for_speech(text):
    if not text:
        return ""
    # Strip markdown headers, bold, italics, code blocks
    cleaned = re.sub(r'[*_#`~]', '', text)
    # Strip bullet points
    cleaned = re.sub(r'^\s*[-•*]\s+', '', cleaned, flags=re.MULTILINE)
    # Normalize whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


@app.route('/tts', methods=['POST'])
def tts():
    try:
        data = request.get_json() or {}
        raw_text = data.get('text', '')
        selected_lang = data.get('language', 'en-US')

        cleaned_text = clean_text_for_speech(raw_text)
        if not cleaned_text:
            return jsonify({"error": "Empty text for speech synthesis"}), 400

        # Select Sinhala ('si') or English ('en')
        if selected_lang == 'si-LK' or is_sinhala(cleaned_text):
            tts_lang = 'si'
        else:
            tts_lang = 'en'

        tts_obj = gTTS(text=cleaned_text, lang=tts_lang, slow=False)
        audio_fp = io.BytesIO()
        tts_obj.write_to_fp(audio_fp)
        audio_fp.seek(0)

        return send_file(
            audio_fp,
            mimetype='audio/mp3',
            as_attachment=False,
            download_name='speech.mp3'
        )

    except Exception as e:
        print(f"TTS generation error: {e}")
        return jsonify({"error": f"TTS generation failed: {str(e)}"}), 500


# =========================================================
# STATUS & HEALTH API
# =========================================================

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "healthy",
        "service": "SmartGrama Multilingual RAG Backend",
        "documents_loaded": len(documents) if 'documents' in globals() and documents else 0,
        "embedding_model": "all-MiniLM-L6-v2",
        "llm_model": "gemma:2b / tinyllama",
        "multilingual_supported": ["en-US", "si-LK"]
    })


@app.route('/')
def home():
    return "SmartGrama AI Backend Running"


# =========================================================
# RUN FLASK SERVER
# =========================================================

if __name__ == '__main__':
    print()
    print("============================================")
    print("     SmartGrama AI Backend Starting")
    print("============================================")
    print("Backend: http://127.0.0.1:5000")
    print()

    app.run(
        debug=False,
        host='0.0.0.0',
        port=5000
    )