# import os
# from fastapi import FastAPI, HTTPException, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# import uvicorn
# from ResumeParser import process_resume_analysis
# from JdGenerator import generate_structured_jd
# from ATS import score_resume
# from interviewer import run_interview_chat 
# from interview_analyzer import analyze_interview_with_gemini  


# app = FastAPI(title="HireFlow AI Engine", version="0.1.0")

# app.add_middleware(
# 	CORSMiddleware,
# 	allow_origins=["*"],
# 	allow_credentials=True,
# 	allow_methods=["*"],
# 	allow_headers=["*"],
# )


# @app.get("/")
# def root() -> dict[str, str]:
# 	return {"message": "AI Engine is running"}

# @app.get("/health")
# def health() -> dict[str, str]:
# 	return {"status": "ok"}

# @app.post("/api/resume-parser")
# async def resume_parser(file: UploadFile = File(...)) -> dict:
#     allowed_extensions = {".pdf", ".docx", ".txt"}
#     file_ext = os.path.splitext(file.filename)[1].lower()
    
#     if file_ext not in allowed_extensions:
#         raise HTTPException(
#             status_code=400, 
#             detail=f"Unsupported file type: {file_ext}. Supported: {allowed_extensions}"
#         )

#     try:
#         result = await process_resume_analysis(file)
#         return result
#     except HTTPException:
#         raise
#     except Exception as e:
#         error_message = str(e)
#         if "429" in error_message and ("quota" in error_message.lower() or "rate limit" in error_message.lower()):
#             raise HTTPException(
#                 status_code=429,
#                 detail="AI resume parsing is temporarily rate-limited. Please try again later."
#             )
#         raise HTTPException(status_code=500, detail=error_message)
    
# @app.post("/api/jd-generator")
# def jd_generator(title: str, brief_notes: str = None) -> dict:
#     return generate_structured_jd(title, brief_notes)

# @app.post("/api/ats-score")
# def ats_score(jd_json: dict, resume_json: dict) -> dict:
# 	return score_resume(jd_json, resume_json)

# @app.post("/api/assesment-generator")
# def assesment_generator(internal_assessment_plan: dict) -> dict:
#     from Assesment import generate_interview_assessment_with_gemini
#     return generate_interview_assessment_with_gemini(internal_assessment_plan)

# @app.post("/api/interview-questions")
# def interview_questions(job_role: str, mandatory_skills: list, current_interview_plan: dict, resume_summary: dict, assessment_scores: dict) -> dict:
#     from Interview import generate_interview_questions
#     return generate_interview_questions(job_role, mandatory_skills, current_interview_plan, resume_summary, assessment_scores)

# if __name__ == "__main__":
# 	uvicorn.run(app, host="0.0.0.0", port=8000)




import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
from ResumeParser import process_resume_analysis
from JdGenerator import generate_structured_jd
from ATS import score_resume
from Interview import run_interview_chat  
from interview_analyzer import analyze_interview_with_gemini  

app = FastAPI(title="HireFlow AI Engine", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Existing endpoints =====
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
    except HTTPException:
        raise
    except Exception as e:
        error_message = str(e)
        if "429" in error_message and ("quota" in error_message.lower() or "rate limit" in error_message.lower()):
            raise HTTPException(
                status_code=429,
                detail="AI resume parsing is temporarily rate-limited. Please try again later."
            )
        raise HTTPException(status_code=500, detail=error_message)

@app.post("/api/jd-generator")
def jd_generator(
    title: str = Query(..., description="Job title"),
    brief_notes: str = Query(None, description="Optional recruiter notes")
) -> dict:
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


# ===== ✅ NEW AI INTERVIEW ENDPOINTS =====

class ChatMessage(BaseModel):
    role: str
    content: str

class InterviewerRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    company: str = Field(default="Tech Company")
    role_name: str = Field(default="Software Engineer")
    topics: str | List[str] = Field(default="General")
    resume_summary: str = Field(default="No resume provided")
    interview_duration_sec: int = Field(default=0)
    difficulty: str = Field(default="moderate")
    end_call_prompt_count: int = Field(default=0)
    interview_prompt: str = Field(default="")

@app.post("/Interview")
async def interviewer_chat_endpoint(request: InterviewerRequest):
    """AI Interviewer chat endpoint"""
    try:
        if not request.message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        formatted_history = [
            {"role": m.role, "content": m.content} for m in request.history
        ]

        topics_text = ", ".join(request.topics) if isinstance(request.topics, list) else request.topics

        result = run_interview_chat(
            user_input=request.message,
            chat_history=formatted_history,
            company=request.company,
            role_name=request.role_name,
            topics=topics_text,
            resume_summary=request.resume_summary,
            interview_duration_sec=request.interview_duration_sec,
            difficulty=request.difficulty,
            end_call_prompt_count=request.end_call_prompt_count,
            interview_prompt=request.interview_prompt,
        )

        return {
            "status": "success",
            "reply": result.get("reply", ""),
            "allotted_time_sec": result.get("allotted_time_sec", 45),
            "interview_ended": result.get("interview_ended", False),
            "end_call_prompted": result.get("end_call_prompted", False),
            "endCallPromptCount": result.get("end_call_prompt_count", 0),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Interviewer error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class TranscriptItem(BaseModel):
    speaker: str = Field(default="")
    text: str = Field(default="")

class InterviewAnalysisRequest(BaseModel):
    transcript: List[TranscriptItem] = Field(default_factory=list)
    company: str = Field(default="Tech Company")
    role_name: str = Field(default="Software Engineer")
    topics: str | List[str] = Field(default="General")
    resume_summary: str = Field(default="No resume provided")
    interview_duration_sec: int = Field(default=0)

@app.post("/analyze")
async def analyze_interview(request: InterviewAnalysisRequest):
    """Analyze completed interview transcript"""
    try:
        transcript_list = [
            {"speaker": item.speaker, "text": item.text}
            for item in request.transcript
        ]

        topics_text = ", ".join(request.topics) if isinstance(request.topics, list) else request.topics

        result = analyze_interview_with_gemini(
            transcript=transcript_list,
            company=request.company,
            role_name=request.role_name,
            topics=topics_text,
            resume_summary=request.resume_summary,
            interview_duration_sec=request.interview_duration_sec
        )

        if "error" in result:
            print(f"Analysis error: {result['error']}")
            raise HTTPException(status_code=500, detail="Analysis failed")

        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Analyze error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)