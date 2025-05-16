from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from backend.utils.parser import clean_text
from backend.utils.doc_gen import save_json_and_txt
from backend.utils.prompt_builder import build_prompt
from backend.utils.ollama import generate_cover_letter
import json

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
