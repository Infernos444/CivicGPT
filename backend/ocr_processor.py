import pytesseract
import fitz  # PyMuPDF
from PIL import Image
import io
import os
import re

class OCRProcessor:
    def __init__(self):
        # Default path for macOS Tesseract
        pytesseract.pytesseract.tesseract_cmd = '/usr/local/bin/tesseract'
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF using PyMuPDF and OCR fallback"""
        text = ""
        try:
            doc = fitz.open(pdf_path)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                page_text = page.get_text()
                if page_text:
                    text += page_text + "\n"
            doc.close()
            
            # If no text extracted, use OCR
            if not text.strip():
                print("No text found, using OCR fallback...")
                text = self._ocr_pdf(pdf_path)
            else:
                print(f"✅ Text extracted directly: {len(text)} characters")
                
        except Exception as e:
            print(f"PDF extraction failed, using OCR: {e}")
            text = self._ocr_pdf(pdf_path)
        return text.strip()
    
    def _ocr_pdf(self, pdf_path):
        """OCR fallback when text extraction fails"""
        text = ""
        try:
            doc = fitz.open(pdf_path)
            for page_num in range(len(doc)):
                pix = doc.load_page(page_num).get_pixmap()
                img_data = pix.tobytes("ppm")
                img = Image.open(io.BytesIO(img_data))
                page_text = pytesseract.image_to_string(img, lang='eng')
                if page_text.strip():
                    text += f"Page {page_num + 1}:\n{page_text}\n\n"
            doc.close()
            print(f"✅ OCR extracted: {len(text)} characters")
        except Exception as e:
            print(f"OCR failed: {e}")
        return text.strip()
    
    def extract_text_from_image(self, image_path):
        """Extract text from image using OCR"""
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image, lang='eng')
            print(f"✅ Image OCR extracted: {len(text)} characters")
            return text.strip()
        except Exception as e:
            print(f"Image OCR failed: {e}")
            return ""
    
    def process_payslip(self, payslip_path):
        """Extract structured salary data from payslip"""
        if payslip_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            text = self.extract_text_from_image(payslip_path)
        else:
            text = self.extract_text_from_pdf(payslip_path)
        
        payslip_data = {
            'raw_text': text or '',
            'basic_salary': self._extract_salary(text, 'basic'),
            'hra': self._extract_salary(text, 'hra'),
            'total_income': self._extract_salary(text, 'gross'),
            'deductions': self._extract_salary(text, 'deduction'),
            'net_salary': self._extract_salary(text, 'net')
        }
        
        # Ensure no None values
        for key in payslip_data:
            if payslip_data[key] is None:
                payslip_data[key] = 0 if key != 'raw_text' else ''
                
        return payslip_data
    
    def _extract_salary(self, text, keyword):
        """Extract salary amounts using regex patterns"""
        if not text:
            return 0
            
        patterns = {
            'basic': [
                r'basic[\s:₹rs]*\s*(\d+[,]?\d*)',
                r'basic\s*salary[\s:₹rs]*\s*(\d+[,]?\d*)'
            ],
            'hra': [
                r'hra[\s:₹rs]*\s*(\d+[,]?\d*)',
                r'house\s*rent[\s:₹rs]*\s*(\d+[,]?\d*)'
            ],
            'gross': [
                r'gross[\s:₹rs]*\s*(\d+[,]?\d*)',
                r'total\s*income[\s:₹rs]*\s*(\d+[,]?\d*)',
                r'gross\s*salary[\s:₹rs]*\s*(\d+[,]?\d*)'
            ],
            'deduction': [
                r'deduction[\s:₹rs]*\s*(\d+[,]?\d*)',
                r'total\s*deduction[\s:₹rs]*\s*(\d+[,]?\d*)'
            ],
            'net': [
                r'net[\s:₹rs]*\s*(\d+[,]?\d*)',
                r'take\s*home[\s:₹rs]*\s*(\d+[,]?\d*)',
                r'net\s*salary[\s:₹rs]*\s*(\d+[,]?\d*)'
            ]
        }
        
        for pattern in patterns.get(keyword, []):
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    return int(matches[0].replace(',', ''))
                except ValueError:
                    continue
        return 0

# Global instance
ocr_processor = OCRProcessor()