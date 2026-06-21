import httpx
from app.config import settings
from app.utils.exceptions import ServiceException

async def call_groq_chat_api(prompt: str, system_prompt: str) -> str:
    if not hasattr(settings, 'groq_api_key') or not settings.groq_api_key:
        raise ServiceException("Groq API key is missing.")
        
    url = 'https://api.groq.com/openai/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {settings.groq_api_key}',
        'Content-Type': 'application/json'
    }
    data = {
        'model': 'llama-3.3-70b-versatile',
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': prompt}
        ]
    }
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(url, headers=headers, json=data)
        if response.status_code != 200:
            raise ServiceException(f"Groq API Error: {response.text}")
        return response.json()['choices'][0]['message']['content']
