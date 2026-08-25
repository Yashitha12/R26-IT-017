from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle

# -----------------------------------
# Load Embedding Model
# -----------------------------------
model = SentenceTransformer(
    'all-MiniLM-L6-v2'
)

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
# Split Into Chunks
# -----------------------------------
documents = [

    chunk.strip()

    for chunk in text.split('\n\n')

    if chunk.strip()
]

# -----------------------------------
# Create Embeddings
# -----------------------------------
embeddings = model.encode(documents)

# -----------------------------------
# Create FAISS Index
# -----------------------------------
dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(
    dimension
)

index.add(
    np.array(embeddings)
)

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
with open(
    'rag/documents.pkl',
    'wb'
) as f:

    pickle.dump(
        documents,
        f
    )

print("Embeddings created successfully!")