import os
import json
from xml.parsers.expat import model
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("Missing Gemini API key.")

genai.configure(api_key=api_key)
model = genai.GenerativeModel(os.getenv("GEMINI_MODEL_NAME"))

def score_resume(jd_json_data, resume_json_data):
    """
    Takes the structured JD and structured Resume, compares them, 
    and outputs a score along with personalized interview questions.
    """
    
    prompt = f"""
    You are an elite ATS (Applicant Tracking System) and Senior Technical Assessor.
    Your objective is to strictly evaluate a candidate's Resume against a Job Description.

    Job Description JSON:
    {json.dumps(jd_json_data)}

    Candidate Resume JSON:
    {json.dumps(resume_json_data)}

    Instructions for Evaluation:
    1. Heavily weight 'mandatory_technical_skills' over 'nice_to_have_skills'.
    2. Compare the required experience years against the candidate's actual experience.
    3. Generate strictly 2 to 3 'personalized_interview_topics'. These MUST connect a requirement from the JD to a specific project or achievement listed in the Resume. 

    You must respond ONLY with a valid JSON object matching this exact schema:
    {{
        "match_percentage": "A number between 0 and 100 representing how well the resume matches the JD based on the criteria above.",
        "match_reasoning": "A concise 2-sentence summary of why they received this score. Highlight the biggest strength and biggest gap.",
        "missing_mandatory_skills": ["List any mandatory skills from the JD that are completely missing in the resume"],
        "personalized_interview_topics": [
            "A specific technical question asking how they implemented a JD requirement in their specific project (mention the project name)."
        ]
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        scoring_result = json.loads(response.text)
        return scoring_result

    except json.JSONDecodeError:
         return {"error": "Failed to parse scoring response into JSON."}
    except Exception as e:
         return {"error": f"An API error occurred: {str(e)}"}