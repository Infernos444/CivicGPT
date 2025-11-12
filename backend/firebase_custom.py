import requests
import os
import firebase_admin
from firebase_admin import credentials, firestore
from firebase_admin import storage as firebase_storage
from datetime import datetime

def initialize_firebase():
    """Initialize Firebase once"""
    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate("civicgpt-37e2b-firebase-adminsdk-fbsvc-e765cffc36.json")
            firebase_admin.initialize_app(cred, {
                'storageBucket': 'civicgpt-37e2b.appspot.com'
            })
            print("✅ Firebase initialized successfully!")
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            raise

# ✅ Initialize and set up global references
initialize_firebase()
bucket = firebase_storage.bucket()
db = firestore.client()

def clean_firebase_data(data):
    """Remove any undefined/None values for Firebase"""
    if isinstance(data, dict):
        return {k: clean_firebase_data(v) for k, v in data.items() if v is not None}
    elif isinstance(data, list):
        return [clean_firebase_data(item) for item in data if item is not None]
    else:
        return data

def download_file(file_url, local_path):
    """Download file from Firebase Storage"""
    try:
        if file_url.startswith('gs://'):
            blob_path = file_url.replace('gs://civicgpt-37e2b.appspot.com/', '')
            blob = bucket.blob(blob_path)
            blob.download_to_filename(local_path)
            print(f"✅ Downloaded from gs://: {blob_path}")
        else:
            response = requests.get(file_url)
            response.raise_for_status()
            with open(local_path, 'wb') as f:
                f.write(response.content)
            print(f"✅ Downloaded from URL: {file_url}")
        return True
    except Exception as e:
        print(f"❌ Error downloading file: {e}")
        return False

def store_extracted_text(session_id, policy_text, payslip_text):
    """Store extracted OCR text in Firestore"""
    try:
        data = {
            "extractedText": {
                "policy": policy_text or '',
                "payslip": payslip_text or ''
            },
            "lastUpdated": datetime.now().isoformat()
        }
        
        clean_data = clean_firebase_data(data)
        db.collection("civicgpt_sessions").document(session_id).update(clean_data)
        print("✅ Stored extracted text in Firestore")
    except Exception as e:
        print(f"❌ Firestore store error: {e}")

def update_session_status(session_id, status, data=None):
    """Update session status in Firestore"""
    try:
        update_data = {
            "status": status,
            "lastUpdated": datetime.now().isoformat(),
            "updatedAt": firestore.SERVER_TIMESTAMP
        }
        
        if data:
            clean_data = clean_firebase_data(data)
            update_data.update(clean_data)
        
        db.collection("civicgpt_sessions").document(session_id).update(update_data)
        print(f"✅ Session {session_id} updated to status: {status}")
    except Exception as e:
        print(f"❌ Firestore update error: {e}")

def save_question_answer(session_id, question, answer, metadata=None):
    """Save Q&A to Firestore with proper data types"""
    try:
        session_ref = db.collection("civicgpt_sessions").document(session_id)
        session_data = session_ref.get()
        
        if session_data.exists:
            current_questions = session_data.to_dict().get('questions', [])
            
            question_data = {
                'question': question or '',
                'answer': answer or '',
                'timestamp': datetime.now().isoformat(),
                'ai_generated': True
            }
            
            if metadata:
                question_data.update(clean_firebase_data(metadata))
            
            current_questions.append(question_data)
            
            session_ref.update({
                'questions': current_questions,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            
            print("✅ Question and answer saved to Firestore")
            return True
        return False
    except Exception as e:
        print(f"❌ Error saving Q&A: {e}")
        return False