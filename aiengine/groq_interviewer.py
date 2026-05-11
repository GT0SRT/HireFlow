import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)
CHAT_MODEL = os.getenv("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile")

def get_system_prompt(company, role, topics, resume_summary, interview_summary, difficulty="moderate"):
    # Difficulty-specific guidance
    difficulty_guidance = {
        "basic": """
    DIFFICULTY LEVEL: BASIC
    - Focus on foundational concepts and fundamental understanding.
    - Ask about basic principles and core definitions.
    - For Software Engineers: Basic DSA (arrays, linked lists, sorting), OOPS basics.
    - For Product Managers: Product fundamentals, basic user research, simple metrics.
    - For Designers: Design principles, basic UI/UX concepts, user needs.
    - Avoid advanced optimization questions.
    - If candidate struggles, provide supportive feedback and move forward.
    """,
        "moderate": """
    DIFFICULTY LEVEL: MODERATE
    - Balance breadth and depth of questions.
    - Ask follow-up questions to gauge understanding depth.
    - For Software Engineers: Medium DSA problems (trees, graphs, dynamic programming), system design basics, design patterns.
    - For Product Managers: Feature prioritization, growth metrics, stakeholder management, user retention.
    - For Designers: Interaction design, design systems, user research methods, A/B testing.
    - Expect some problem-solving and analytical thinking.
    """,
        "tough": """
    DIFFICULTY LEVEL: TOUGH
    - Deep dive into advanced concepts and edge cases.
    - Ask complex, multi-faceted problems with tradeoff discussions.
    - For Software Engineers: Advanced system design (distributed systems, scalability), optimization, edge cases, LLD + HLD.
    - For Product Managers: Complex market dynamics, advanced analytics, technical depth, strategic pivots, growth at scale.
    - For Designers: Advanced interaction patterns, accessibility, complex user journeys, design at scale, data-driven design decisions.
    - Expect strong problem-solving and architectural thinking.
    - Challenge assumptions and explore alternative approaches.
    """
    }
    
    difficulty_section = difficulty_guidance.get(difficulty, difficulty_guidance["moderate"])
    
    return f"""
    You are an expert Senior Technical Interviewer at {company}. 
    You are interviewing a candidate for the {role} position.
    
    CORE TOPICS: {topics}
    CANDIDATE CONTEXT (from Resume): {resume_summary}

    INTERVIEW PROGRESS SO FAR (Memory): {interview_summary}
    
    {difficulty_section}
    
    YOUR GUIDELINES:
    1. VOICE-READY: Keep responses under 2-3 short sentences. Long paragraphs are bad for voice.
    2. ONE-AT-A-TIME: Ask exactly ONE question. Never list multiple questions.
    3. FLOW: Acknowledge the user's answer briefly ("Good point", "I see"), then ask a follow-up or a new question.
    4. TOPIC FOCUS: Stick to {topics}. If the candidate is struggling, give a tiny hint or move to the next question.
    5. INTERRUPT-FRIENDLY: Be concise so the user can easily respond.
    6. DIFFICULTY ALIGNMENT: Ensure your questions match the {difficulty} difficulty level.

    OUTPUT FORMAT (STRICT JSON ONLY, no markdown):
    {{
      "reply": "string",
      "allotted_time_sec": 45,
      "assessment": {{
        "strengths": ["string", "string"],
        "improvements": ["string", "string"],
        "confidence": "low|medium|high"
      }}
    }}

    RULES FOR allotted_time_sec:
    - Give user enough uninterrupted thinking/speaking time.
    - Keep between 20 and 90 seconds.
    - Hard/long technical questions: 45-90
    - Simple follow-ups: 20-45
    """


def _safe_parse_json(content):
    if not content:
        return None

    try:
        return json.loads(content)
    except Exception:
        pass

    match = re.search(r"\{[\s\S]*\}", content)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            return None
    return None
    
def Interviewer(user_input, chat_history=None, company=None, role=None, topics=None, resume_summary="No resume provided", interview_summary="No interview history", interview_duration_sec=0, max_interview_duration_sec=900, difficulty="moderate"):
    if chat_history is None:
        chat_history = []

    # Check if interview time limit reached (default 15 min = 900 sec)
    if max_interview_duration_sec and interview_duration_sec >= max_interview_duration_sec:
        return {
            "reply": "Thank you for this comprehensive interview. We've covered a lot of ground today. That's all the time we have—you did great! I'll share feedback soon.",
            "allotted_time_sec": 0,
            "assessment": {
                "strengths": [],
                "improvements": [],
                "confidence": "medium",
            },
            "interview_ended": True,
        }

    normalized_history = []
    for message in chat_history:
        msg_role = message.get("role", "assistant") if isinstance(message, dict) else "assistant"
        msg_content = message.get("content", "") if isinstance(message, dict) else ""

        if msg_role not in {"user", "assistant"}:
            msg_role = "assistant"

        normalized_history.append({"role": msg_role, "content": msg_content})

    recent_history = normalized_history[-6:]

    system_message = {
        "role": "system",
        "content": get_system_prompt(company, role, topics, resume_summary, interview_summary, difficulty)
    }

    messages = [system_message] + recent_history + [{"role": "user", "content": user_input}]

    completion = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        temperature=0.6,
        max_tokens=260,
        top_p=1,
        stream=False,
        stop=None,
    )

    content = completion.choices[0].message.content
    parsed = _safe_parse_json(content)

    if not isinstance(parsed, dict):
        return {
            "reply": (content or "Could you walk me through your answer in a bit more detail?").strip(),
            "allotted_time_sec": 45,
            "assessment": {
                "strengths": [],
                "improvements": [],
                "confidence": "medium",
            },
        }

    reply = str(parsed.get("reply") or "Could you walk me through your answer in a bit more detail?").strip()
    allotted_time_sec = parsed.get("allotted_time_sec", 45)
    try:
        allotted_time_sec = int(allotted_time_sec)
    except Exception:
        allotted_time_sec = 45
    allotted_time_sec = max(20, min(90, allotted_time_sec))

    assessment = parsed.get("assessment") or {}
    strengths = assessment.get("strengths") if isinstance(assessment.get("strengths"), list) else []
    improvements = assessment.get("improvements") if isinstance(assessment.get("improvements"), list) else []
    confidence = assessment.get("confidence") if assessment.get("confidence") in {"low", "medium", "high"} else "medium"

    return {
        "reply": reply,
        "allotted_time_sec": allotted_time_sec,
        "assessment": {
            "strengths": [str(item).strip() for item in strengths if str(item).strip()][:3],
            "improvements": [str(item).strip() for item in improvements if str(item).strip()][:3],
            "confidence": confidence,
        },
    }