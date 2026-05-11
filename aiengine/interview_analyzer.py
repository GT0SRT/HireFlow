import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('models/gemini-2.5-flash')

def analyze_interview_with_gemini(
    transcript: list,
    company: str = "HireFlow",
    role_name: str = "Software Engineer",
    topics: str = "General",
    resume_summary: str = "No resume provided",
    interview_duration_sec: int = 0
) -> dict:
    transcript_text = "\n".join([
        f"{item.get('speaker', 'Unknown')}: {item.get('text', '')}"
        for item in transcript if isinstance(item, dict)
    ])

    analysis_prompt = f"""
    You are an AI Interview Coach for {company}.
    Your goal is to provide coaching-oriented, clear, encouraging feedback to the candidate using "You" phrasing.

    CONTEXT:
    - Target Role: {role_name} at {company}
    - Skills Focus: {topics}
    - Candidate Background: {resume_summary}
    - Interview Duration (sec): {interview_duration_sec}

    TRANSCRIPT:
    {transcript_text}

    STRICT INSTRUCTIONS:
    1. Use second-person language ("You ...") throughout the feedback text fields.
    2. Keep feedback practical and coaching-focused.
    3. Do not include markdown.
    4. Return valid JSON only.

    OUTPUT JSON SHAPE:
    {{
        "overall_score": number (0-10),
        "metrics": {{
            "technical": number (0-10),
            "behavioral": number (0-10),
            "communication": number (0-10),
            "problem_solving": number (0-10),
            "company_knowledge": number (0-10)
        }},
        "topics_covered": ["topic1", "topic2"],
        "overall_assessment": "You ...",
        "key_strengths": ["You articulated...", "Your explanation of..."],
        "areas_for_improvement": ["Try to...", "Next time, consider mentioning..."],
        "recommendation": "strong_yes | yes | maybe | no",
        "reasoning": "You ..."
    }}
    """

    try:
        response = model.generate_content(
            analysis_prompt,
            generation_config={
                "response_mime_type": "application/json"
            }
        )
        data = json.loads(response.text)

        def normalize_score(value):
            try:
                numeric = float(value)
            except (TypeError, ValueError):
                return value
            if numeric > 10 and numeric <= 100:
                numeric = numeric / 10
            return max(0, min(10, numeric))

        if isinstance(data, dict):
            if "overall_score" in data:
                data["overall_score"] = normalize_score(data.get("overall_score"))
            metrics = data.get("metrics")
            if isinstance(metrics, dict):
                for key, val in metrics.items():
                    metrics[key] = normalize_score(val)
        return data

    except Exception as e:
        print(f"Critical Gemini Error: {e}")
        return {"error": "Could not generate analysis. Please contact support."}