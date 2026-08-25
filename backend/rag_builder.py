from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle

# -----------------------------------
# Load Embedding Model
# -----------------------------------
model = SentenceTransformer('all-MiniLM-L6-v2')

# -----------------------------------
# Read Knowledge Base
# -----------------------------------
with open(
    'knowledge_base/smartgrama_data.txt',
    'r',
    encoding='utf-8'
) as f:

    text = f.read()

# -----------------------------------
# Split into Chunks
# -----------------------------------
chunks = [
    chunk.strip()
    for chunk in text.split('\n\n')
    if chunk.strip()
]

# -----------------------------------
# Create Embeddings
# -----------------------------------
embeddings = model.encode(chunks)

# -----------------------------------
# Create FAISS Index
# -----------------------------------
embedding_size = embeddings.shape[1]

index = faiss.IndexFlatL2(embedding_size)

index.add(np.array(embeddings))

# -----------------------------------
# Save FAISS Index
# -----------------------------------
faiss.write_index(
    index,
    'rag/faiss_index.bin'
)

# -----------------------------------
# Save Documents
# -----------------------------------
with open('rag/documents.pkl', 'wb') as f:

    pickle.dump(chunks, f)

# -----------------------------------
# Save Embeddings
# -----------------------------------
np.save(
    'rag/embeddings.npy',
    embeddings
)

print("RAG knowledge base created successfully.")