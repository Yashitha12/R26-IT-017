import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load FAISS index
index = faiss.read_index('rag/faiss_index.bin')

# Load documents
with open('rag/documents.pkl', 'rb') as f:
    documents = pickle.load(f)

# -----------------------------
# Search Function
# -----------------------------
def retrieve_context(query, k=3):

    # Convert query into embedding
    query_embedding = model.encode([query])

    # Search FAISS
    distances, indices = index.search(
        np.array(query_embedding),
        k
    )

    # Get matching documents
    results = [
        documents[i]
        for i in indices[0]
    ]

    return "\n".join(results)