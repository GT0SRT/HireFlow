import os
import itertools
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(__file__)
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Load and parse multiple Gemini keys (comma separated)
gemini_keys_str = os.getenv("GEMINI_API_KEYS") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
gemini_keys = [k.strip() for k in gemini_keys_str.split(",") if k.strip()]
gemini_cycle = itertools.cycle(gemini_keys) if gemini_keys else None

def get_next_gemini_key():
    if not gemini_cycle:
        raise RuntimeError("Missing Gemini API keys. Please set GEMINI_API_KEYS in your .env")
    return next(gemini_cycle)

# Load and parse multiple Groq keys (comma separated)
groq_keys_str = os.getenv("GROQ_API_KEYS") or os.getenv("GROQ_API_KEY") or ""
groq_keys = [k.strip() for k in groq_keys_str.split(",") if k.strip()]
groq_cycle = itertools.cycle(groq_keys) if groq_keys else None

def get_next_groq_key():
    if not groq_cycle:
        return None
    return next(groq_cycle)