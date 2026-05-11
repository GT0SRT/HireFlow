import json
import os
from typing import Any, Dict, List

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)
CHAT_MODEL = os.getenv("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile")


def _normalize_history(chat_history: List[Dict[str, Any]] | None) -> List[Dict[str, str]]:
    if not chat_history:
        return []

    normalized: List[Dict[str, str]] = []
    for message in chat_history:
        if not isinstance(message, dict):
            continue
        role = message.get("role", "assistant")
        if role not in {"user", "assistant"}:
            role = "assistant"
        content = str(message.get("content", "")).strip()
        if not content:
            continue
        normalized.append({"role": role, "content": content})

    return normalized


def _build_system_prompt(company: str, role_name: str, topics: str, difficulty: str, turn_index: int, end_call_prompt_count: int) -> str:
    return f"""
You are an expert technical interviewer for {company} interviewing a candidate for {role_name}.

INTERVIEW TOPICS: {topics}
DIFFICULTY: {difficulty}
CURRENT TURN INDEX: {turn_index}
END CALL PROMPTS SENT: {end_call_prompt_count}

RULES:
1. Keep output concise and voice-friendly (max 2-3 short sentences).
2. If this is the start of interview (user sends START_SESSION or no prior user turns), greet warmly, ask for a brief introduction.
3. Follow this question flow naturally across multiple turns: Introduction → Resume/Projects → Behavioral → Technical → Company Motivation.
4. Ask exactly one question at a time, spreading the interview across at least 10-12 meaningful turns.
5. MUST ask at least one of: "Why do you want to join {company}?" OR "What do you know about {company}?" before ending.
6. Adapt your next question based on the candidate's previous answer.
7. Keep the interview natural and human, not robotic. Let candidates speak fully.
8. After 12+ user turns AND covering all question types, ask: "Do you have any questions for me? If not, you may leave by clicking the End Call button."
9. Only set end_call_prompted=true when you explicitly ask if they have questions or tell them to end the call.
10. Never ask multiple questions in one turn.
11. Maintain interviewer tone and continuity from the previous turns.
12. Use English only. Never use Hinglish or mixed-language responses.

Return STRICT JSON only with this shape:
{{
  "reply": "string",
  "allotted_time_sec": 20-90,
  "interview_ended": true|false,
  "end_call_prompted": true|false
}}

"end_call_prompted" should be true ONLY when you ask the user if they have questions or prompt them to end the call.
"""


def run_interview_chat(
    *,
    user_input: str,
    chat_history: List[Dict[str, Any]] | None = None,
    company: str = "Tech Company",
    role_name: str = "Software Engineer",
    topics: str = "General",
    resume_summary: str = "No resume provided",
    interview_duration_sec: int = 0,
    difficulty: str = "moderate",
    end_call_prompt_count: int = 0,
    interview_prompt: str | None = None,
) -> Dict[str, Any]:
    normalized_history = _normalize_history(chat_history)
    user_turns = sum(1 for item in normalized_history if item.get("role") == "user")
    turn_index = user_turns + (0 if user_input == "START_SESSION" else 1)

    prompt_from_request = (interview_prompt or "").strip()
    if prompt_from_request:
        system_prompt = prompt_from_request
    else:
        system_prompt = _build_system_prompt(company, role_name, topics, difficulty, turn_index, end_call_prompt_count)

    system_message = {
        "role": "system",
        "content": system_prompt,
    }

    messages: List[Dict[str, str]] = [system_message, *normalized_history]
    messages.append({
        "role": "system",
        "content": f"Candidate resume summary: {resume_summary}. Interview elapsed seconds: {interview_duration_sec}.",
    })
    messages.append({"role": "user", "content": user_input})

    completion = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        temperature=0.5,
        max_tokens=240,
        response_format={"type": "json_object"},
    )

    content = completion.choices[0].message.content or "{}"
    payload = json.loads(content)

    reply = str(payload.get("reply") or "Could you explain your approach in more detail?").strip()
    allotted_time_sec = payload.get("allotted_time_sec", 45)
    try:
        allotted_time_sec = int(allotted_time_sec)
    except (TypeError, ValueError):
        allotted_time_sec = 45
    allotted_time_sec = max(20, min(90, allotted_time_sec))

    end_call_prompted = bool(payload.get("end_call_prompted", False))
    new_prompt_count = end_call_prompt_count + (1 if end_call_prompted else 0)

    # Only end if AI explicitly sets it (frontend will handle 3-silence auto-disconnect)
    interview_ended = bool(payload.get("interview_ended", False))

    lower_reply = reply.lower()
    hinglish_markers = [" kya ", " kaise ", " aap ", " bata", "sahayta", "yahaan", "haan", "nahi"]
    if any(marker in f" {lower_reply} " for marker in hinglish_markers):
        rewrite_completion = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": "Rewrite the following into natural professional English. Keep meaning same. Output JSON with key 'reply'."},
                {"role": "user", "content": reply},
            ],
            temperature=0.2,
            max_tokens=180,
            response_format={"type": "json_object"},
        )
        rewrite_content = rewrite_completion.choices[0].message.content or "{}"
        rewrite_payload = json.loads(rewrite_content)
        rewritten = str(rewrite_payload.get("reply") or "").strip()
        if rewritten:
            reply = rewritten

    if new_prompt_count >= 3:
        reply = "Thank you for your time today. The interview is now complete. Please click End Call."
        interview_ended = True

    return {
        "reply": reply,
        "allotted_time_sec": allotted_time_sec,
        "interview_ended": interview_ended,
        "end_call_prompted": end_call_prompted,
        "end_call_prompt_count": new_prompt_count,
    }