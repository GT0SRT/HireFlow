import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("Missing Gemini API key.")

genai.configure(api_key=api_key)
model = genai.GenerativeModel(os.getenv("GEMINI_MODEL_NAME"))

def generate_interview_assessment_with_gemini(internal_assessment_plan) -> dict:
    prompt = f"""
    You are an expert Technical Recruiter and AI Assessor. Based on following Internal Assessment Plan,
    generate a JSON object consisting of multiple-choice questions (MCQs). The questions should be
    designed to accurately evaluate the candidate's fit based on the assessment plan topics.

    Internal Assessment Plan:
    {json.dumps(internal_assessment_plan)}

    Instructions:
    1. For EACH test defined in the plan, generate an appropriate number of multiple-choice questions 
    strictly relevant to its focus topics. Scale the number of questions based on the `suggested_duration_minutes` 
    provided in the plan (e.g., roughly 1 question per 2-3 minutes).
    2. Set a practical "time_allotted" based on the plan's duration, but you may adjust it slightly depending on 
    the difficulty and exact number of questions generated.
    3. Each question must have exactly 4 options.
    4. Identify the correct answer and provide a brief 1-sentence explanation.
    5. You must respond ONLY with a valid JSON object matching this exact schema:
    {{
        "assessments": [
            {{
                "test_type": "Name of the test from the plan (e.g., Coding, Behavioral)",
                "time_allotted": "Time allotted for the test",
                "questions": [
                    {{
                        "topic": "The specific focus topic being tested",
                        "question_text": "The question itself",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correct_answer": "The exact string of the correct option",
                        "explanation": "Brief explanation of why it is correct"
                    }}
                ]
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
    except json.JSONDecodeError:
         return {"error": "Failed to parse AI response into JSON format."}
    except Exception as e:
        return {"error": f"An API error occurred: {str(e)}"}