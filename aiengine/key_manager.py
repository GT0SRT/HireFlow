import os
import itertools
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(__file__)
env_file = os.path.join(BASE_DIR, ".env")

# Load with override=True to ensure keys from the local .env are picked up
if os.path.exists(env_file):
    load_dotenv(env_file, override=True)
else:
    # Still attempt to load any environment configured in the environment
    load_dotenv(override=True)

# Load and parse multiple Gemini keys (comma separated)
gemini_keys_str = os.getenv("GEMINI_API_KEYS") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
gemini_keys = [k.strip() for k in gemini_keys_str.split(",") if k.strip()]
gemini_cycle = itertools.cycle(gemini_keys) if gemini_keys else None

def get_next_gemini_key():
    if not gemini_cycle:
        raise RuntimeError("Missing Gemini API keys. Please set GEMINI_API_KEYS in your environment or aiengine/.env")
    return next(gemini_cycle)

# Load and parse multiple Groq keys (comma separated)
groq_keys_str = os.getenv("GROQ_API_KEYS") or os.getenv("GROQ_API_KEY") or ""
groq_keys = [k.strip() for k in groq_keys_str.split(",") if k.strip()]
groq_cycle = itertools.cycle(groq_keys) if groq_keys else None

def get_next_groq_key():
    if not groq_cycle:
        return None
    return next(groq_cycle)

# Debug helper: print a warning on import if no keys are configured
if not gemini_keys and not groq_keys:
    try:
        import sys
        print(f"[key_manager] WARNING: No AI provider keys found. Checked: {env_file} (exists={os.path.exists(env_file)})", file=sys.stderr)
    except Exception:
        pass