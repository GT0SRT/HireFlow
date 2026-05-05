import os
import json
from dotenv import load_dotenv

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
if groq_api_key:
    try:
        from groq import Groq
        groq_client = Groq(api_key=groq_api_key)
    except ImportError:
        groq_client = None
else:
    groq_client = None

def process_interview_turn(question_data: dict, candidate_response: str, chat_history: list) -> dict:
    if not groq_client:
        return {"error": "Groq client is not initialized. Please set GROQ_API_KEY and install the groq package."}

    system_prompt = f"""
    You are an expert Technical Interviewer. You are evaluating the candidate on the following question:
    Topic: {question_data.get("topic")}
    Question: {question_data.get("question")}
    Expected Key Points: {", ".join(question_data.get("expected_key_points", []))}

    Your goal is to evaluate if the candidate has sufficiently answered the question and covered the expected key points.
    If their answer is incomplete, ask a brief follow-up question to guide them. 
    If their answer is complete, or if they are unable to answer after a follow-up, conclude the discussion on this question, score it (out of 10), and mark it as complete.

    You must respond ONLY with a valid JSON object matching this exact schema:
    {{
        "response_to_candidate": "Your follow-up question or closing remark for this topic",
        "is_complete": boolean (true if ready to move to the next question, false if you are asking a follow-up),
        "score": integer between 0 and 10 (only provide if is_complete is true, else null),
        "feedback": "Internal feedback on why they received this score (only provide if is_complete is true)"
    }}
    """

    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in chat_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    messages.append({"role": "user", "content": candidate_response})

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model="llama3-8b-8192", 
            response_format={"type": "json_object"},
            temperature=0.5
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
         return {"error": f"Groq API error: {str(e)}"}