import requests
import time
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Groq API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"  # Using Groq's Llama model

# OpenAI API configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
OPENAI_MODEL = "gpt-4o-mini"

def generate_cover_letter(prompt: str) -> str:
    max_retries = 3
    base_delay = 2 
    
    # Try Groq first
    if GROQ_API_KEY:
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": GROQ_MODEL,
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000,
                        "stream": False
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    # Extract the message content from the response
                    cover_letter = result["choices"][0]["message"]["content"].strip()
                    return cover_letter
                else:
                    print(f"[Groq API Error] Status code: {response.status_code}")
                    print(f"[Groq API Error] Response: {response.text}")
                    
            except Exception as e:
                print(f"[Groq API Error] {e}")

            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                print(f"Error occurred with Groq. Retrying in {delay} seconds...")
                time.sleep(delay)
                continue
    else:
        print("GROQ_API_KEY is not set. Skipping Groq.")

    print("Groq generation failed or was skipped. Falling back to OpenAI...")
    
    # Fallback to OpenAI
    if not OPENAI_API_KEY:
        print("OPENAI_API_KEY is not set. Cannot fallback to OpenAI.")
        return "I'm sorry, something went wrong while generating the cover letter."

    for attempt in range(max_retries):
        try:
            response = requests.post(
                OPENAI_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": OPENAI_MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000,
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                # Extract the message content from the response
                cover_letter = result["choices"][0]["message"]["content"].strip()
                return cover_letter
            else:
                print(f"[OpenAI API Error] Status code: {response.status_code}")
                print(f"[OpenAI API Error] Response: {response.text}")
                
        except Exception as e:
            print(f"[OpenAI API Error] {e}")

        if attempt < max_retries - 1:
            delay = base_delay * (2 ** attempt)
            print(f"Error occurred with OpenAI. Retrying in {delay} seconds...")
            time.sleep(delay)
            continue
            
    return "I'm sorry, something went wrong while generating the cover letter."