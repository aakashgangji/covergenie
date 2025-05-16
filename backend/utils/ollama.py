import requests
import time

def generate_cover_letter(prompt: str) -> str:
    max_retries = 3
    base_delay = 2  # Base delay in seconds
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "mistral",
                    "prompt": prompt,
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                return response.json()["response"].strip()
            else:
                print(f"[Ollama Error] Status code: {response.status_code}")
                return "I'm sorry, something went wrong while generating the cover letter."
                
        except Exception as e:
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                print(f"Error occurred. Retrying in {delay} seconds...")
                time.sleep(delay)
                continue
            print(f"[Ollama Error] {e}")
            return "I'm sorry, something went wrong while generating the cover letter." 