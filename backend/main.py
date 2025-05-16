from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from backend.utils.parser import clean_text
from backend.utils.prompt_builder import build_prompt
from backend.utils.ollama import generate_cover_letter
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
import json
import tempfile
import os

app = FastAPI()

@app.post("/generate")
async def generate(request: Request):
    try:
        data = await request.json()
        job_desc = clean_text(data["job_description"])
        with open("resume/resume_data.json") as f:
            resume_data = json.load(f)
        prompt = build_prompt(resume_data, job_desc, data["company"], data["title"])
        print("[Prompt Sent to Ollama]:", prompt[:300])
        cover_letter = generate_cover_letter(prompt)
        return JSONResponse({
            "success": True,
            "cover_letter": cover_letter,
            "preview": job_desc[:200] + "..."  # Preview of job description
        })
    except Exception as e:
        print("[Internal Server Error]", e)
        return JSONResponse({
            "success": False,
            "error": str(e)
        })

@app.post("/download-docx")
async def download_docx(request: Request):
    try:
        data = await request.json()
        cover_letter = data["cover_letter"]
        
        # Create a new Document
        doc = Document()
        
        # Set default font to Times New Roman
        style = doc.styles['Normal']
        style.font.name = 'Times New Roman'
        style.font.size = Pt(12)
        
        # Add the cover letter text
        paragraph = doc.add_paragraph(cover_letter)
        paragraph.style = style
        
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
        temp_file.close()
        
        # Save the document
        doc.save(temp_file.name)
        
        # Return the file
        return FileResponse(
            temp_file.name,
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            filename='cover_letter.docx',
            background=None
        )
    except Exception as e:
        print("[Internal Server Error]", e)
        return JSONResponse({
            "success": False,
            "error": str(e)
        })
