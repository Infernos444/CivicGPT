import faiss
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
import ollama
import re
import numpy as np
from datetime import datetime

class CivicGptRAG:
    def __init__(self):
        print("Initializing FAISS vector database...")
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200,
            length_function=len
        )
        self.vector_store = None
        print("✅ FAISS vector database ready!")

    def process_documents(self, policy_text, payslip_data):
        """Process documents and create vector store"""
        try:
            if not policy_text and not payslip_data:
                raise ValueError("No documents provided for processing")
            
            # Split policy text into chunks
            policy_chunks = []
            if policy_text:
                policy_chunks = self.text_splitter.split_text(policy_text)
            
            # Create payslip context
            payslip_context = self._create_payslip_context(payslip_data)
            
            # Combine all texts
            texts = policy_chunks + [payslip_context]
            
            if not texts:
                raise ValueError("No text content extracted from documents")
            
            # Create vector store
            self.vector_store = FAISS.from_texts(texts, self.embeddings)
            print(f"✅ Stored {len(texts)} chunks in FAISS DB")
            return len(texts)
            
        except Exception as e:
            print(f"❌ Error processing documents: {e}")
            raise e

    def _create_payslip_context(self, payslip_data):
        """Create structured context from payslip data"""
        context = "USER PAYSLIP INFORMATION:\n"
        
        if payslip_data.get('basic_salary'):
            context += f"Basic Salary: ₹{payslip_data['basic_salary']:,}\n"
        if payslip_data.get('hra'):
            context += f"House Rent Allowance: ₹{payslip_data['hra']:,}\n"
        if payslip_data.get('total_income'):
            context += f"Total Gross Income: ₹{payslip_data['total_income']:,}\n"
        if payslip_data.get('deductions'):
            context += f"Current Deductions: ₹{payslip_data['deductions']:,}\n"
        if payslip_data.get('net_salary'):
            context += f"Net Salary: ₹{payslip_data['net_salary']:,}\n"
            
        # Add raw text snippet
        raw_text = payslip_data.get('raw_text', '')
        if raw_text:
            context += f"\nRaw Text Preview:\n{raw_text[:500]}..."
        
        return context

    def ask_question(self, question, session_id=None):
        """Answer question using FAISS + Local LLM"""
        if not self.vector_store:
            return "Please upload and process documents first.", []
        
        try:
            print(f"🔍 Searching FAISS for: {question}")
            
            # Get relevant context using FAISS
            docs = self.vector_store.similarity_search(question, k=3)
            relevant_chunks = [doc.page_content for doc in docs]
            
            if not relevant_chunks:
                return "I couldn't find relevant information in your documents to answer this question.", []
            
            print(f"✅ Found {len(relevant_chunks)} relevant chunks from FAISS")
            
            # Prepare context for LLM
            context = "\n\n".join(relevant_chunks)
            
            # Create prompt for local LLM
            prompt = f"""You are CivicGPT, a helpful AI tax assistant that explains complex tax policies in simple terms.

CONTEXT FROM USER'S DOCUMENTS:
{context}

USER'S QUESTION: {question}

INSTRUCTIONS:
1. Answer based ONLY on the provided context
2. Explain tax concepts in simple, easy-to-understand language
3. Be specific about tax sections (like 80C, 80D, etc.) and amounts
4. Provide practical, actionable advice
5. Mention the source sections from the policy document when possible

ANSWER:"""
            
            # Call local LLM (Ollama)
            print("🤖 Calling local LLM...")
            response = ollama.generate(
                model="llama3.2:1b",
                prompt=prompt,
                options={
                    'temperature': 0.1,
                    'num_predict': 500
                }
            )
            
            answer = response['response'].strip()
            print("✅ Got response from local LLM")
            
            # Extract sources
            sources = []
            for chunk in relevant_chunks:
                # Extract section numbers if present
                sections = re.findall(r'section\s+(\d+[A-Z]*)', chunk, re.IGNORECASE)
                if sections:
                    sources.extend([f"Section {sec.upper()}" for sec in sections])
            
            sources = list(set(sources))[:3]  # Remove duplicates, limit to 3
            
            return answer, sources
            
        except Exception as e:
            print(f"❌ RAG error: {e}")
            return f"I encountered an error processing your question: {str(e)}", []

    def generate_tax_analysis(self, policy_text, payslip_data):
        """Generate tax analysis using LLM"""
        try:
            preview = policy_text[:1500] + "..." if len(policy_text) > 1500 else policy_text
            
            prompt = f"""
Analyze the user's tax situation and provide specific recommendations.

TAX POLICY DOCUMENT:
{preview}

PAYSLIP DETAILS:
{self._create_payslip_context(payslip_data)}

Provide a clear tax analysis covering:
1. Estimated tax liability based on income
2. Potential tax savings opportunities
3. Key applicable tax sections (80C, 80D, HRA, etc.)
4. Specific actionable recommendations
5. Required documents for claims

Keep the analysis practical and easy to understand.
"""
            response = ollama.generate(
                model="llama3.2:1b", 
                prompt=prompt,
                options={'temperature': 0.1, 'num_predict': 600}
            )
            return response["response"].strip()
            
        except Exception as e:
            print(f"❌ Tax analysis error: {e}")
            return "Tax analysis is currently unavailable. Please try again later."

# Global instance
rag_pipeline = CivicGptRAG()