import requests
import time

# Groq API configuration
GROQ_API_KEY = "xxx"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"  # Using Groq's Llama model

def generate_cover_letter(prompt: str) -> str:
    max_retries = 3
    base_delay = 2  # Base delay in seconds
    
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
                return "I'm sorry, something went wrong while generating the cover letter."
                
        except Exception as e:
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                print(f"Error occurred. Retrying in {delay} seconds...")
                time.sleep(delay)
                continue
            print(f"[Groq API Error] {e}")
            return "I'm sorry, something went wrong while generating the cover letter." 