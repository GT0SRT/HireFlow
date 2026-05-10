import os
import io
import fitz
from docx import Document
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import UploadFile, HTTPException
from key_manager import get_next_gemini_key

load_dotenv()


async def extract_text_from_file(file: UploadFile) -> str:
    filename = file.filename.lower()
    content = await file.read()
    
    if filename.endswith(".pdf"):
        text = ""
        with fitz.open(stream=content, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        return text
        
    elif filename.endswith(".docx"):        
        doc = Document(io.BytesIO(content))
        return "\n".join([para.text for para in doc.paragraphs])
    
    elif filename.endswith(".txt"):
        return content.decode("utf-8")
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format.")

async def process_resume_analysis(file: UploadFile):
    text = await extract_text_from_file(file)

    if not text.strip():
        return {"error": "Could not extract text from this document."}

    api_key = get_next_gemini_key()
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(os.getenv("GEMINI_MODEL_NAME"))

    prompt = f"""
    You are an expert Technical Recruiter and AI Assessor. Analyze the following resume text and extract the key information.
    
    Resume Text:
    {text}
    
    You must respond ONLY with a valid JSON object matching this exact schema:
    {{
        "executive_summary": "A 2-3 sentence overview of the candidate's profile.",
        "primary_role": "The main job title they are suited for (e.g., Full-Stack Developer, Data Scientist).",
        "experience_years": "Total years of experience as a number or a short string (e.g., '3 years', 'Fresher').",
        "top_technical_skills": ["skill1", "skill2", "skill3"],
        "notable_projects": [
            {{
                "name": "Project Name",
                "description": "Short 1-sentence description of what they built and the impact."
            }}
        ],
        "interview_deep_dive_topics": ["Specific technical topic 1 based on their resume", "Topic 2", "Topic 3"]
    }}
    
    Do not include any markdown formatting like ```json or any conversational text outside the JSON object.
    """

    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    import json
    try:
        clean_text = response.text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
            
        return json.loads(clean_text.strip())
    except json.JSONDecodeError:
         return {"error": "Failed to parse AI response into JSON format."}