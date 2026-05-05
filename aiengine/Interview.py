import os
import json
from typing import Any, Dict, List
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("Missing Gemini API key.")

genai.configure(api_key=api_key)
model = genai.GenerativeModel(os.getenv("GEMINI_MODEL_NAME", "gemini-1.5-flash"))

def generate_interview_questions(job_role: str, mandatory_skills: list, current_interview_plan: dict, resume_summary: dict, assessment_scores: dict) -> dict:
    prompt = f"""
    You are an Expert Technical Recruiter. You are preparing questions for a specific interview round.

    Role: {job_role}
    Required Skills: {", ".join(mandatory_skills)}
    Current Interview Round Plan: {json.dumps(current_interview_plan)}
    Resume Summary: {json.dumps(resume_summary)}
    Assessment Scores: {json.dumps(assessment_scores)}

    Generate a structured JSON object containing some key interview questions tailored EXACTLY to the 'Current Interview Round Plan'. 
    Do not ask questions outside the scope of this specific round's focus topics. 
    Focus on bridging their experience with the required skills and addressing any weak points from the assessments.

    You must respond ONLY with a valid JSON object matching this exact schema:
    {{
        "interview_plan": [
            {{
                "topic": "Topic Name (from the current interview round focus topics)",
                "question": "The actual question to ask",
                "expected_key_points": ["Key point 1", "Key point 2"]
            }}
        ]
    }}
    """
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": str(e)}

def evaluate_final_interview(scores: list) -> dict:
    if not scores:
        return {"error": "No scores provided."}
        
    mean_score = sum(scores) / len(scores)
    shortlisted = mean_score >= 7.0
    
    return {
        "aggregate_score": round(mean_score, 2),
        "shortlisted": shortlisted,
        "reasoning": f"Candidate achieved a mean score of {round(mean_score, 2)}/10."
    }