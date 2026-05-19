#!/usr/bin/env bash
vars=(GROQ_API_KEYS GROQ_API_KEY GROQ_MODEL_NAME GEMINI_API_KEYS GEMINI_API_KEY GEMINI_MODEL_NAME AI_ENGINE_URL MONGO_URI JWT_SECRET SESSION_SECRET)
echo "Checking important environment variables (presence only):"
for v in "${vars[@]}"; do
  if [ -n "${!v}" ]; then
    printf "%s : SET\n" "$v"
  else
    printf "%s : NOT SET\n" "$v"
  fi
done
echo "Note: This script only checks presence, not validity."
