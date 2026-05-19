import os
import json
from typing import Any, Dict, List
from dotenv import load_dotenv
from ai_provider import call_ai_with_fallback

load_dotenv()

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
    return call_ai_with_fallback(prompt)

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