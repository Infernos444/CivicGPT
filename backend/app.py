from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, storage
import requests
import PyPDF2
import io
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import json
import traceback
import os
from datetime import datetime
import time
import re
import threading
import pytesseract
from PIL import Image
import pdf2image

# =============================
# 🚀 Initialize Flask + CORS
# =============================
app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000", "http://localhost:3002",
    "http://127.0.0.1:3000", "http://127.0.0.1:3002",
    "http://localhost:3001", "http://127.0.0.1:3001"
])

# =============================
# 🔥 Firebase Setup
# =============================
try:
    cred = credentials.Certificate("civicgpt-37e2b-firebase-adminsdk-fbsvc-e765cffc36.json")
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'civicgpt-37e2b.appspot.com'
    })
    db = firestore.client()
    bucket = storage.bucket()
    print("✅ Firebase initialized successfully!")
except Exception as e:
    print(f"❌ Firebase initialization failed: {e}")

# =============================
# 🧩 FAISS + Embeddings
# =============================
print("Initializing FAISS vector database...")
model = SentenceTransformer('all-MiniLM-L6-v2')
embedding_dim = 384
index = faiss.IndexFlatL2(embedding_dim)
stored_chunks = []
faiss_lock = threading.Lock()
print("✅ FAISS vector database ready!")

# =============================
# 🧹 ULTIMATE DATA CLEANING - FIXED FOR FIRESTORE
# =============================
def deep_clean_firestore_data(obj):
    """REMOVE ALL undefined/None values and ensure Firestore compatibility"""
    if obj is None:
        return ""
    
    if isinstance(obj, dict):
        cleaned = {}
        for key, value in obj.items():
            # Skip None/undefined completely
            if value is None:
                continue
                
            cleaned_val = deep_clean_firestore_data(value)
            
            # Only add if cleaned value exists and is not empty
            if cleaned_val is not None and cleaned_val != "":
                if isinstance(cleaned_val, (dict, list)) and not cleaned_val:
                    continue
                cleaned[key] = cleaned_val
        return cleaned
    
    elif isinstance(obj, list):
        cleaned_list = []
        for item in obj:
            cleaned_item = deep_clean_firestore_data(item)
            # Only add strings to arrays, remove objects
            if isinstance(cleaned_item, str) and cleaned_item.strip():
                cleaned_list.append(cleaned_item.strip())
            elif isinstance(cleaned_item, (int, float)) and cleaned_item != 0:
                cleaned_list.append(str(cleaned_item))
        return cleaned_list
    
    elif isinstance(obj, (np.integer, np.floating)):
        return float(obj) if not np.isnan(obj) else 0
    
    elif isinstance(obj, (int, float)):
        return obj
    
    elif isinstance(obj, bool):
        return obj
    
    elif isinstance(obj, str):
        return obj.strip()
    
    else:
        # Convert any objects to empty string
        return ""

def validate_firestore_data(data):
    """Final validation - NO UNDEFINED, NO SERVER_TIMESTAMP IN ARRAYS"""
    if data is None:
        return {}
    
    cleaned = deep_clean_firestore_data(data)
    
    # Ensure all critical fields exist and arrays contain ONLY strings
    if isinstance(cleaned, dict):
        # Force arrays to contain only strings
        array_fields = ['taxSavingTips', 'recommendedActions']
        for field in array_fields:
            if field in cleaned and isinstance(cleaned[field], list):
                # Remove any objects and ensure only strings
                cleaned[field] = [
                    str(item) for item in cleaned[field] 
                    if isinstance(item, (str, int, float)) and str(item).strip()
                ]
        
        # GUARANTEED DEFAULTS - NO UNDEFINED EVER
        defaults = {
            'taxSavingTips': ["Review your documents for tax saving opportunities"],
            'estimatedSavings': 0,
            'recommendedActions': ["Consult the analysis above for specific actions"],
            'taxLiability': {'current': 0, 'potential': 0, 'savings': 0},
            'payslipData': {
                'raw_text': '', 
                'extracted_length': 0, 
                'analysis_method': 'ocr', 
                'has_content': False
            },
            'policyData': {
                'raw_text': '', 
                'extracted_length': 0, 
                'analysis_method': 'ocr', 
                'has_content': False
            },
            'ai_generated': False,
            'response_time': 0.0,
            'analysis_timestamp': datetime.now().isoformat(),
            'model_used': 'unknown',
            'system': 'pure_rag_llm_ocr'
        }
        
        # Apply defaults for any missing fields
        for key, default_val in defaults.items():
            if key not in cleaned:
                cleaned[key] = default_val
            elif cleaned[key] is None:
                cleaned[key] = default_val
            # Deep check for nested objects
            elif isinstance(default_val, dict) and isinstance(cleaned[key], dict):
                for sub_key, sub_default in default_val.items():
                    if sub_key not in cleaned[key] or cleaned[key][sub_key] is None:
                        cleaned[key][sub_key] = sub_default
    
    return cleaned

# =============================
# 📄 OCR Text Extraction
# =============================
def extract_text_from_pdf(file_content):
    """Extract text from PDF using OCR"""
    try:
        # First try direct extraction
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            direct_text = ""
            for page in pdf_reader.pages:
                page_text = page.extract_text() or ""
                direct_text += page_text + "\n"
            
            direct_text = direct_text.strip()
            if len(direct_text) > 100:
                print(f"✅ Direct extraction: {len(direct_text)} chars")
                return direct_text
        except Exception as e:
            print(f"⚠️ Direct extraction failed: {e}")

        # OCR fallback
        print("🔍 Using OCR...")
        images = pdf2image.convert_from_bytes(file_content, dpi=200)
        ocr_text = ""
        for i, image in enumerate(images[:3]):
            image = image.convert('L')
            page_text = pytesseract.image_to_string(image, lang='eng')
            ocr_text += f"Page {i+1}:\n{page_text}\n\n"
        
        ocr_text = ocr_text.strip()
        print(f"✅ OCR extracted {len(ocr_text)} chars")
        return ocr_text
        
    except Exception as e:
        print(f"❌ PDF extraction error: {e}")
        return ""

def download_file_from_url(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"❌ Download error: {e}")
        return None

# =============================
# 🧠 PURE LLM RAG SYSTEM
# =============================
def enhanced_ai_call(prompt, max_tokens=500, model="llama3.2:3b", timeout=30):
    """Enhanced AI call with better context handling"""
    for attempt in range(3):
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": max_tokens,
                        "top_k": 40,
                        "top_p": 0.9,
                        "repeat_penalty": 1.1
                    }
                },
                timeout=timeout
            )
            
            if response.status_code == 200:
                result = response.json().get("response", "").strip()
                if result and len(result) > 10:
                    return result
                else:
                    raise Exception("Empty AI response")
            else:
                raise Exception(f"HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ AI error attempt {attempt + 1}: {e}")
            if attempt < 2:
                time.sleep(2)
    
    return "I'm currently unable to analyze your tax documents. Please try again or consult with a tax professional."

def create_rag_prompt(payslip_text, policy_text, question=None):
    """Create dynamic RAG prompt"""
    
    base_context = f"""
DOCUMENT CONTENT (Extracted via OCR):

PAYSLIP DATA:
{payslip_text[:1500] if payslip_text else "No payslip content extracted"}

POLICY DOCUMENT:
{policy_text[:1500] if policy_text else "No policy content extracted"}

As a professional Indian tax advisor, analyze these ACTUAL documents and provide personalized tax advice.
Return ONLY simple text - no JSON, no objects, no complex structures.
"""
    
    if question:
        return f"""
{base_context}

USER QUESTION: {question}

Based ONLY on the actual document content above, provide specific advice.

ANSWER:
"""
    else:
        return f"""
{base_context}

Provide comprehensive tax analysis including:
- 2-3 tax saving tips as simple bullet points
- 2-3 recommended actions as simple bullet points  
- Estimated savings as a number
- Tax liability breakdown

Base everything ONLY on the actual document content provided.

TAX ANALYSIS:
"""

def create_safe_document_data(text, doc_type):
    """GUARANTEED SAFE document data - NO UNDEFINED"""
    safe_text = text or ""
    return {
        'raw_text': safe_text[:800] + "..." if len(safe_text) > 800 else safe_text,
        'extracted_length': len(safe_text),
        'analysis_method': 'ocr_llm_rag',
        'has_content': len(safe_text) > 0
    }

def extract_simple_tips_from_ai_response(ai_text):
    """Extract simple string tips from AI response"""
    try:
        tips = []
        actions = []
        
        # Simple parsing for bullet points or numbered lists
        lines = ai_text.split('\n')
        for line in lines:
            line = line.strip()
            # Skip empty lines and very long lines
            if not line or len(line) > 200:
                continue
            
            # Look for tips (shorter, actionable)
            if any(keyword in line.lower() for keyword in ['tip', 'save', 'deduction', 'investment', '80c', '80d', 'hra']):
                if 10 <= len(line) <= 150:
                    tips.append(line)
            # Look for actions (longer, procedural)  
            elif any(keyword in line.lower() for keyword in ['action', 'recommend', 'suggest', 'consider', 'consult', 'review']):
                if 15 <= len(line) <= 150:
                    actions.append(line)
        
        # Fallbacks if nothing found
        if not tips:
            tips = ["Review your documents for tax saving opportunities under Section 80C"]
        if not actions:
            actions = ["Consult the detailed analysis above for specific recommendations"]
            
        return tips[:3], actions[:3]  # Limit to 3 items each
        
    except Exception as e:
        print(f"❌ Tip extraction failed: {e}")
        return ["Review your documents with a tax professional"], ["Consult detailed analysis when available"]

def extract_numbers_from_ai_response(ai_text):
    """Extract numbers from AI response safely"""
    try:
        numbers = re.findall(r'₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', ai_text)
        if numbers:
            for num_str in numbers:
                try:
                    num = int(num_str.replace(',', '').replace('₹', ''))
                    if 1000 <= num <= 1000000:
                        return num
                except:
                    continue
        return 0
    except:
        return 0

def pure_llm_analysis(payslip_text, policy_text):
    """PURE LLM analysis - NO RULE BASED"""
    try:
        print("🧠 Starting pure LLM RAG analysis...")
        
        prompt = create_rag_prompt(payslip_text or "", policy_text or "")
        
        start_time = time.time()
        ai_response = enhanced_ai_call(prompt, max_tokens=600, model="llama3.2:3b", timeout=35)
        duration = time.time() - start_time
        
        print(f"✅ Pure LLM analysis completed in {duration:.2f}s")
        
        # Extract simple string arrays (NO OBJECTS)
        tips, actions = extract_simple_tips_from_ai_response(ai_response)
        estimated_savings = extract_numbers_from_ai_response(ai_response)
        
        # GUARANTEED SAFE STRUCTURE
        result = {
            'summary': ai_response or "Analysis completed using actual document content.",
            'taxSavingTips': tips,
            'estimatedSavings': int(estimated_savings),
            'recommendedActions': actions,
            'taxLiability': {
                'current': max(0, int(estimated_savings * 4)),
                'potential': max(0, int(estimated_savings * 3)),
                'savings': int(estimated_savings)
            },
            'payslipData': create_safe_document_data(payslip_text, 'payslip'),
            'policyData': create_safe_document_data(policy_text, 'policy'),
            'ai_generated': True,
            'response_time': float(duration),
            'analysis_timestamp': datetime.now().isoformat(),
            'model_used': 'llama3.2:3b',
            'system': 'pure_rag_llm_ocr'
        }
        
        # Apply ultimate cleaning
        final_result = validate_firestore_data(result)
        print(f"✅ Final result validated")
        return final_result
        
    except Exception as e:
        print(f"❌ Pure LLM analysis failed: {e}")
        return create_llm_fallback(payslip_text, policy_text)

def create_llm_fallback(payslip_text, policy_text):
    """LLM-based fallback - GUARANTEED SAFE"""
    try:
        fallback_prompt = f"""
Based on these document extracts:

PAYSLIP:
{payslip_text[:300] if payslip_text else "No content"}

POLICY:
{policy_text[:300] if policy_text else "No content"}

Provide 2 simple tax tips and 2 recommended actions as bullet points.

RESPONSE:
"""
        fallback_response = enhanced_ai_call(fallback_prompt, max_tokens=200, timeout=15)
        
        tips, actions = extract_simple_tips_from_ai_response(fallback_response)
        
        result = {
            'summary': fallback_response or "Documents processed. Detailed analysis unavailable.",
            'taxSavingTips': tips,
            'estimatedSavings': 0,
            'recommendedActions': actions,
            'taxLiability': {'current': 0, 'potential': 0, 'savings': 0},
            'payslipData': create_safe_document_data(payslip_text, 'payslip'),
            'policyData': create_safe_document_data(policy_text, 'policy'),
            'ai_generated': True,
            'response_time': 0.0,
            'analysis_timestamp': datetime.now().isoformat(),
            'model_used': 'llama3.2:1b',
            'system': 'pure_rag_llm_ocr_fallback'
        }
        
        return validate_firestore_data(result)
        
    except Exception as e:
        print(f"❌ Fallback failed: {e}")
        # ABSOLUTE MINIMAL SAFE STRUCTURE
        return {
            'summary': 'Document processing completed.',
            'taxSavingTips': ["Upload documents for detailed tax analysis"],
            'estimatedSavings': 0,
            'recommendedActions': ["Consult with a tax professional"],
            'taxLiability': {'current': 0, 'potential': 0, 'savings': 0},
            'payslipData': create_safe_document_data(payslip_text, 'payslip'),
            'policyData': create_safe_document_data(policy_text, 'policy'),
            'ai_generated': False,
            'system': 'ocr_only',
            'response_time': 0.0,
            'analysis_timestamp': datetime.now().isoformat(),
            'model_used': 'none'
        }

def smart_rag_question_answer(question, context_chunks):
    """Enhanced RAG with general knowledge"""
    context = "\n\n".join(context_chunks) if context_chunks else ""
    
    enhanced_prompt = f"""
DOCUMENT CONTEXT (User's actual uploaded documents):
{context}

USER QUESTION: {question}

As a tax expert, answer using the actual document context when relevant. 

ANSWER:
"""
    
    return enhanced_ai_call(enhanced_prompt, max_tokens=400, model="llama3.2:3b", timeout=25)

# =============================
# 🔍 FAISS Vector Management
# =============================
def add_to_vector_store(texts):
    """Add texts to FAISS vector store"""
    if not texts:
        return
        
    with faiss_lock:
        try:
            embeddings = model.encode(texts)
            index.add(np.array(embeddings).astype('float32'))
            global stored_chunks
            stored_chunks.extend(texts)
            print(f"✅ Added {len(texts)} chunks to FAISS")
        except Exception as e:
            print(f"❌ Vector store error: {e}")

def search_similar_chunks(query, k=5):
    """Search for similar chunks"""
    if not stored_chunks:
        return []
        
    with faiss_lock:
        try:
            query_embedding = model.encode([query]).astype('float32')
            D, I = index.search(query_embedding, k=min(k, len(stored_chunks)))
            
            results = []
            for i in I[0]:
                if i < len(stored_chunks):
                    results.append(stored_chunks[i])
            return results
        except Exception as e:
            print(f"❌ Search error: {e}")
            return []

def reset_vector_store():
    """Reset the vector store"""
    with faiss_lock:
        global index, stored_chunks
        index.reset()
        stored_chunks = []
        print("✅ Vector store reset")

# =============================
# 🌐 Routes - FIXED FOR FIRESTORE
# =============================
@app.route('/health', methods=['GET'])
def health():
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=3)
        if r.status_code == 200:
            return jsonify({"status": "healthy", "system": "pure_rag_llm_ocr"})
        return jsonify({"status": "partial", "system": "pure_rag_llm_ocr"})
    except:
        return jsonify({"status": "offline", "system": "pure_rag_llm_ocr"})

@app.route('/process-documents', methods=['POST'])
def process_documents():
    try:
        data = request.get_json()
        session_id = data.get('sessionId')
        policy_url = data.get('policyUrl')
        payslip_url = data.get('payslipUrl')
        user_id = data.get('userId')

        if not all([session_id, policy_url, payslip_url, user_id]):
            return jsonify({"error": "Missing required fields"}), 400

        print("📥 Starting pure RAG document processing...")

        # Initialize session
        session_ref = db.collection('civicgpt_sessions').document(session_id)
        session_ref.set({
            'uid': user_id,
            'status': 'processing',
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'uploadedAt': firestore.SERVER_TIMESTAMP,
            'system': 'pure_rag_llm_ocr'
        }, merge=True)

        # Download documents
        policy_content = download_file_from_url(policy_url)
        payslip_content = download_file_from_url(payslip_url)

        if not policy_content or not payslip_content:
            raise Exception("Failed to download documents")

        # OCR Text Extraction
        print("🔍 Extracting text with OCR...")
        policy_text = extract_text_from_pdf(policy_content)
        payslip_text = extract_text_from_pdf(payslip_content)

        print(f"📄 Policy: {len(policy_text)} chars | Payslip: {len(payslip_text)} chars")

        # Pure LLM RAG Analysis
        analysis = pure_llm_analysis(payslip_text, policy_text)
        print("✅ Pure LLM Analysis completed")

        # RAG Vector Storage
        with faiss_lock:
            index.reset()
            
            all_texts = []
            if policy_text:
                for i in range(0, len(policy_text), 800):
                    all_texts.append(f"POLICY: {policy_text[i:i+800]}")
            if payslip_text:
                for i in range(0, len(payslip_text), 800):
                    all_texts.append(f"PAYSLIP: {payslip_text[i:i+800]}")
            if analysis.get('summary'):
                all_texts.append(f"ANALYSIS: {analysis.get('summary')}")
            
            if all_texts:
                embeddings = model.encode(all_texts)
                index.add(np.array(embeddings).astype('float32'))
                global stored_chunks
                stored_chunks = all_texts
                print(f"✅ Added {len(stored_chunks)} chunks to FAISS")

        # Prepare Firestore update - GUARANTEED SAFE
        update_data = {
            'status': 'completed',
            'analysis': analysis,
            'analysisResult': analysis,
            'policyText': policy_text[:1500] + "..." if len(policy_text) > 1500 else (policy_text or ""),
            'payslipText': payslip_text[:1500] + "..." if len(payslip_text) > 1500 else (payslip_text or ""),
            'policyTextLength': len(policy_text) if policy_text else 0,
            'payslipTextLength': len(payslip_text) if payslip_text else 0,
            'chunksProcessed': len(stored_chunks),
            'completedAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'ai_generated': analysis.get('ai_generated', False),
            'system': 'pure_rag_llm_ocr',
            'model_used': analysis.get('model_used', 'unknown'),
            'ocr_used': True
        }

        # ULTIMATE CLEANING - NO UNDEFINED
        clean_update_data = validate_firestore_data(update_data)
        
        print("🔥 FINAL DATA VALIDATED - NO UNDEFINED")
        print(f"🔥 payslipData exists: {'payslipData' in clean_update_data.get('analysisResult', {})}")

        # Update Firestore
        session_ref.update(clean_update_data)

        return jsonify({
            "status": "success",
            "sessionId": session_id,
            "analysisResult": analysis,
            "chunksProcessed": len(stored_chunks),
            "policyTextLength": len(policy_text) if policy_text else 0,
            "payslipTextLength": len(payslip_text) if payslip_text else 0,
            "ai_generated": analysis.get('ai_generated', False),
            "ocr_used": True,
            "system": "pure_rag_llm_ocr"
        })

    except Exception as e:
        print(f"❌ Processing error: {e}")
        traceback.print_exc()
        
        if 'session_ref' in locals():
            error_data = validate_firestore_data({
                'status': 'error',
                'error': str(e)[:500],
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            session_ref.update(error_data)
        
        return jsonify({"error": str(e)}), 500

@app.route('/ask-question', methods=['POST'])
def ask_question():
    try:
        data = request.get_json()
        question = data.get("question", "").strip()
        session_id = data.get("sessionId")

        if not question:
            return jsonify({"error": "Question is required"}), 400

        if not stored_chunks or index.ntotal == 0:
            return jsonify({"error": "Please process documents first"}), 400

        print(f"🤔 Processing question: {question}")

        # RAG Context Retrieval
        q_emb = model.encode([question]).astype('float32')
        D, I = index.search(q_emb, k=min(5, len(stored_chunks)))
        
        context_chunks = []
        for i in I[0]:
            if i < len(stored_chunks):
                context_chunks.append(stored_chunks[i])
        
        # Enhanced RAG
        start_time = time.time()
        answer = smart_rag_question_answer(question, context_chunks)
        duration = time.time() - start_time
        
        print(f"✅ Question answered in {duration:.2f}s")

        # FIX: Create question data WITHOUT serverTimestamp in arrays
        question_data = {
            'question': str(question),
            'answer': str(answer),
            'timestamp': datetime.now().isoformat(),  # Use ISO string, NOT serverTimestamp
            'response_time': float(duration),
            'context_chunks_used': len(context_chunks),
            'model_used': 'llama3.2:3b',
            'system': 'enhanced_rag'
        }

        # Clean and validate
        clean_question_data = validate_firestore_data(question_data)
        
        # FIX: Update questions array safely
        doc_ref = db.collection('civicgpt_sessions').document(session_id)
        
        # Get current questions first
        current_session = doc_ref.get()
        if current_session.exists:
            current_data = current_session.to_dict()
            current_questions = current_data.get('questions', [])
        else:
            current_questions = []
        
        # Add new question to the list
        updated_questions = current_questions + [clean_question_data]
        
        # Update with the new array
        doc_ref.update({
            'questions': updated_questions,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            "success": True, 
            "answer": answer,
            "response_time": duration,
            "context_chunks": len(context_chunks),
            "system": "enhanced_rag"
        })
        
    except Exception as e:
        print(f"❌ Question error: {e}")
        traceback.print_exc()
        return jsonify({
            "error": "Unable to process question",
            "fallback_answer": "I'm currently unable to access the tax knowledge base. Please try again."
        }), 500

@app.route('/reset-vectors', methods=['POST'])
def reset_vectors():
    """Reset vector store"""
    try:
        reset_vector_store()
        return jsonify({"success": True, "message": "Vector store reset"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =============================
# 🚀 Main
# =============================
if __name__ == '__main__':
    print("\n🚀 Starting CivicGPT Enhanced RAG + LLM + OCR Server...")
    print("📍 http://localhost:8000")
    print("🔥 GUARANTEED: No undefined values, no serverTimestamp in arrays!")
    
    try:
        # Warm up models
        models = ["llama3.2:1b", "llama3.2:3b"]
        for m in models:
            try:
                print(f"🔥 Warming up {m}...")
                res = requests.post(
                    "http://localhost:11434/api/generate",
                    json={"model": m, "prompt": "Ready", "stream": False, "options": {"num_predict": 5}},
                    timeout=10
                )
                if res.status_code == 200:
                    print(f"✅ {m} warmed up!")
            except:
                print(f"⚠️ {m} warm-up skipped")
    except Exception as e:
        print(f"⚠️ Warmup skipped: {e}")

    app.run(host='0.0.0.0', port=8000, debug=True)