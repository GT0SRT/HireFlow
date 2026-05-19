import os
import json
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
import google.generativeai as genai
from dotenv import load_dotenv
import key_manager

load_dotenv()


def _strip_codeblocks(text: str) -> str:
    """Remove markdown code block markers from JSON responses."""
    t = text.strip()
    if t.startswith("```json"):
        t = t[7:]
    elif t.startswith("```"):
        t = t[3:]
    if t.endswith("```"):
        t = t[:-3]
    return t.strip()


def _call_gemini(api_key: str, model_name: str, prompt: str) -> str:
    """Call Gemini API with the given key and prompt."""
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    resp = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
    return resp.text


def _call_groq(groq_key: str, model_name: str, prompt: str) -> str:
    """Call Groq API with the given key and prompt."""
    from groq import Groq
    client = Groq(api_key=groq_key)
    chat_completion = client.chat.completions.create(
        messages=[{"role": "system", "content": prompt}],
        model=model_name,
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    content = chat_completion.choices[0].message.content
    if isinstance(content, str):
        return content
    return json.dumps(content)


def call_ai_with_fallback(prompt: str) -> dict:
    """
    Call AI provider (Gemini or Groq) with multi-key retry and fallback.
    
    Tries all Gemini keys sequentially (with longer timeout for first key),
    then falls back to Groq keys. Returns parsed JSON response or error dict.
    
    Environment variables:
    - GEMINI_FIRST_KEY_TIMEOUT_SEC (default 12): timeout for first Gemini key
    - GEMINI_KEY_TIMEOUT_SEC (default 3): timeout for other Gemini keys
    - GROQ_KEY_TIMEOUT_SEC (default 4): timeout for Groq keys
    - AI_PER_KEY_BACKOFF_MS (default 300): backoff between key attempts
    - AI_TOTAL_TIMEOUT_SEC (default 20): total timeout cap
    - GEMINI_MODEL_NAME (default gemini-1.5-flash)
    - GROQ_MODEL_NAME (default llama3-8b-8192)
    """
    first_key_timeout = float(os.getenv("GEMINI_FIRST_KEY_TIMEOUT_SEC", "12"))
    per_key_timeout = float(os.getenv("GEMINI_KEY_TIMEOUT_SEC", "3"))
    per_key_backoff = float(os.getenv("AI_PER_KEY_BACKOFF_MS", "300")) / 1000.0
    total_timeout = float(os.getenv("AI_TOTAL_TIMEOUT_SEC", "20"))

    gemini_model = os.getenv("GEMINI_MODEL_NAME", "gemini-1.5-flash")
    groq_model = os.getenv("GROQ_MODEL_NAME", "llama3-8b-8192")

    start_time = time.time()
    last_err = "No providers configured"

    # Try all Gemini keys
    gemini_keys = getattr(key_manager, 'gemini_keys', []) or []
    if gemini_keys:
        for idx, api_key in enumerate(gemini_keys):
            if time.time() - start_time > total_timeout:
                break
            timeout = first_key_timeout if idx == 0 else per_key_timeout
            try:
                with ThreadPoolExecutor(max_workers=1) as ex:
                    fut = ex.submit(_call_gemini, api_key, gemini_model, prompt)
                    text = fut.result(timeout=timeout)
                clean = _strip_codeblocks(text)
                try:
                    parsed = json.loads(clean)
                    if isinstance(parsed, dict) and parsed.get("error"):
                        last_err = parsed.get("error")
                        continue
                    return parsed
                except Exception:
                    last_err = "Failed to parse JSON from Gemini response"
            except FuturesTimeoutError:
                last_err = f"Gemini key timed out after {timeout}s"
            except Exception as e:
                last_err = str(e)

            time.sleep(per_key_backoff)

    # Fallback: try all Groq keys
    groq_keys = getattr(key_manager, 'groq_keys', []) or []
    if groq_keys:
        for idx, groq_key in enumerate(groq_keys):
            if time.time() - start_time > total_timeout:
                break
            timeout = float(os.getenv("GROQ_KEY_TIMEOUT_SEC", "4"))
            try:
                with ThreadPoolExecutor(max_workers=1) as ex:
                    fut = ex.submit(_call_groq, groq_key, groq_model, prompt)
                    text = fut.result(timeout=timeout)
                clean = _strip_codeblocks(text)
                try:
                    parsed = json.loads(clean)
                    if isinstance(parsed, dict) and parsed.get("error"):
                        last_err = parsed.get("error")
                        continue
                    return parsed
                except Exception:
                    last_err = "Failed to parse JSON from Groq response"
            except FuturesTimeoutError:
                last_err = f"Groq key timed out after {timeout}s"
            except Exception as e:
                last_err = str(e)

            time.sleep(per_key_backoff)

    return {"error": f"All providers failed: {last_err}"}
