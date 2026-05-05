import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from ResumeParser import process_resume_analysis
from JdGenerator import generate_structured_jd
from ATS import score_resume


app = FastAPI(title="HireFlow AI Engine", version="0.1.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
	return {"message": "AI Engine is running"}

@app.get("/health")
def health() -> dict[str, str]:
	return {"status": "ok"}

@app.post("/api/resume-parser")
async def resume_parser(file: UploadFile = File(...)) -> dict:
    allowed_extensions = {".pdf", ".docx", ".txt"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file_ext}. Supported: {allowed_extensions}"
        )

    try:
        result = await process_resume_analysis(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/jd-generator")
def jd_generator(title: str, brief_notes: str = None) -> dict:
    return generate_structured_jd(title, brief_notes)

@app.post("/api/ats-score")
def ats_score(jd_json: dict, resume_json: dict) -> dict:
	return score_resume(jd_json, resume_json)

@app.post("/api/assesment-generator")
def assesment_generator(internal_assessment_plan: dict) -> dict:
    from Assesment import generate_interview_assessment_with_gemini
    return generate_interview_assessment_with_gemini(internal_assessment_plan)

@app.post("/api/interview-questions")
def interview_questions(job_role: str, mandatory_skills: list, current_interview_plan: dict, resume_summary: dict, assessment_scores: dict) -> dict:
    from Interview import generate_interview_questions
    return generate_interview_questions(job_role, mandatory_skills, current_interview_plan, resume_summary, assessment_scores)

if __name__ == "__main__":
	uvicorn.run(app, host="0.0.0.0", port=8000)