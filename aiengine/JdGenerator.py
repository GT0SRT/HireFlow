import os
import json
from dotenv import load_dotenv
from ai_provider import call_ai_with_fallback

load_dotenv()


def generate_structured_jd(title: str, brief_notes: str = None):

    context = brief_notes if brief_notes else "Apply standard industry expectations for this specific role and seniority."

    prompt = f"""
    You are an expert Technical Recruiter and AI Architect. Your task is to generate a comprehensive, structured Job Description based on the provided inputs.
    
    Job Title: {title}
    Recruiter Notes/Brief: {context}
    
    Instructions:
    - If the 'Recruiter Notes' are brief or incomplete, forcefully expand them into a full, professional job description.
    - If the notes are detailed, organize and structure them into the required format.
    - Accurately infer the required technical stack, soft skills, and responsibilities based on the Job Title.
    - Keep the assessment plan concise and practical: generate strictly between 2 to 4 tests total. Do not overload the candidate.
    - Assign highly realistic `suggested_duration_minutes` based on test complexity (e.g., strictly 30-45 mins for theory/MCQs, 60-90 mins for coding). Do NOT assign 60 minutes for basic MCQs.
    - Keep the interview plan highly efficient: strictly 1 or 2 rounds maximum according to role (e.g., Technical and/or Managerial).
    
    You must respond ONLY with a valid JSON object matching this exact schema. INCLUDE a
    `test_description` field that is candidate-facing — a concise paragraph for the "What to Expect"
    section explaining the combined assessment + interview strategy, how many rounds are planned,
    and what each round aims to assess. This `test_description` will be shown to candidates.

    {{
        "primary_role": "Cleaned up, standardized job title (e.g., Senior Frontend Developer).",
        "job_summary": "A high-impact 2-3 sentence overview of the role and its core objectives.",
        "experience_years": "Total years of experience required (e.g., '3-5 years', 'Fresher'). Be realistic based on the title.",
        "mandatory_technical_skills": ["skill1", "skill2", "skill3"],
        "nice_to_have_skills": ["skill4", "skill5"],
        "soft_skills": ["communication", "leadership"],
        "key_responsibilities": [
            "Actionable responsibility 1",
            "Actionable responsibility 2",
            "Actionable responsibility 3"
        ],
        "requirements": [
            "Minimum degree or equivalent experience required.",
            "Specific certification or skill requirement.",
            "Years of relevant experience in related field.",
            "Tools, frameworks, or platform knowledge required."
        ],
        "assessment_plan": [
            {{
                "test_type": "e.g., Coding, Technical, Behavioral, Cognitive, or Math Aptitude",
                "focus_topics": ["Specific objective skill to test 1", "Specific objective skill to test 2"],
                "suggested_duration_minutes": 30
            }}
        ],
        "interview_plan": [
            {{
                "interview_round": "Technical round, Role Fit Check round, or Skillship Round",
                "focus_topics": ["Standard technical discussion topic 1", "Standard technical discussion topic 2"]
            }},
            {{
                "interview_round": "Managerial Round, Vibe Check, or Leadership Discussion",
                "focus_topics": ["Leadership discussion topic", "Culture fit topic"]
            }}
        ],
        "test_description": "A concise, candidate-facing summary of the assessment strategy: how the tests and interviews together evaluate suitability, how many assessment and interview rounds are planned, and what each round will focus on (e.g., coding skills, system design, cultural fit)."
    }}
    """

    return call_ai_with_fallback(prompt)