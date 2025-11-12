import os

class Config:
    # Firebase Admin SDK - Path to JSON credential
    FIREBASE_CREDENTIALS = "civicgpt-37e2b-firebase-adminsdk-fbsvc-e765cffc36.json"

    # Ollama settings (local LLM)
    OLLAMA_BASE_URL = "http://localhost:11434"
    LLM_MODEL = "llama3.2:1b"  # Changed to match your app

    # Server config
    HOST = "0.0.0.0"
    PORT = 8000  # Changed to match your app.py port
    DEBUG = True

    # File settings
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
    
    # CORS settings
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3002", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002"
    ]
    
    # FAISS settings
    EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
    CHUNK_SIZE = 500
    CHUNK_OVERLAP = 50
    
    # AI settings
    AI_TIMEOUT = 30
    MAX_TOKENS = 500
    TEMPERATURE = 0.1