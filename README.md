# 🏛️ CivicGPT — AI-Powered Tax Policy Summarizer & Explainer for Indian Citizens  

**Tech Stack:** React, Flask, LangChain, FAISS, Tesseract OCR, Python, Firebase, Llama 3.2  

CivicGPT is an **AI-driven tax policy interpretation platform** that helps Indian citizens understand income tax laws.  
It reads **official Finance Act PDFs** and **personal payslips**, then explains applicable sections (like 80C, 80D, 10(13A)) in simple, transparent language using **LLMs**.

---

## 🚀 Features  

- 📄 **Reads Real Documents:** Extracts text from payslips and Finance Act PDFs using Tesseract OCR.  
- 🧠 **Retrieval-Augmented Generation (RAG):** Uses LangChain + FAISS to provide section-specific, explainable answers.  
- 🤖 **LLM Reasoning:** Powered by open-source Llama 3.2 via Ollama.  
- 💬 **Explainable Output:** Displays exact law sections used for reasoning.  
- 🌐 **Interactive Frontend:** Built with React + Firebase for seamless user experience.  
- 🔒 **Secure & Private:** Data processed locally — no external APIs required.  

---

## 🧩 Tech Architecture  

```mermaid
flowchart TD
    A[User Uploads Payslip + Policy PDF] --> B[OCR Layer (Tesseract / PyMuPDF)]
    B --> C[Text Cleaning & Chunking]
    C --> D[Embedding via LangChain + FAISS]
    D --> E[LLM (Llama 3.2 via Ollama)]
    E --> F[Flask Backend Response]
    F --> G[React + Firebase Frontend]
