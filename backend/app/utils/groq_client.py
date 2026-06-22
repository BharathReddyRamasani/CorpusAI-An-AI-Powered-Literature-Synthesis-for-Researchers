import logging
import asyncio
from groq import AsyncGroq, InternalServerError, RateLimitError, APIConnectionError
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.config import settings
from app.utils.exceptions import ServiceException

logger = logging.getLogger("app")

_current_key_index = 0
_client_cache: dict = {}

def _get_api_keys() -> list[str]:
    try:
        return settings.groq_keys_list
    except ValueError:
        return []

def _get_cached_client(api_key: str):
    if api_key not in _client_cache:
        _client_cache[api_key] = AsyncGroq(api_key=api_key, max_retries=0)
        logger.debug(f"[Groq] Cached new client instance for key ...{api_key[-4:]}")
    return _client_cache[api_key]

@retry(
    wait=wait_exponential(multiplier=1.5, min=3, max=30),
    stop=stop_after_attempt(12),
    retry=retry_if_exception_type((RateLimitError, InternalServerError, APIConnectionError)),
    reraise=True
)
async def call_groq_api_with_rotation(prompt: str, system_prompt: str, is_json: bool = False) -> str:
    global _current_key_index
    keys = _get_api_keys()
    
    if not keys:
        raise ServiceException("No Groq API keys configured.")

    model_name = settings.groq_model
    current_key = keys[_current_key_index % len(keys)]
    
    try:
        client = _get_cached_client(current_key)
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        kwargs = {
            "messages": messages,
            "model": model_name,
        }
        if is_json:
            kwargs["response_format"] = {"type": "json_object"}
        
        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.content
        
    except (RateLimitError, InternalServerError, APIConnectionError) as e:
        logger.warning(f"Groq API Error ({type(e).__name__}): {e}. Rotating key and retrying...")
        _current_key_index = (_current_key_index + 1) % len(keys)
        raise # Let tenacity handle the sleep and retry
    except Exception as e:
        if "invalid_api_key" in str(e).lower() or "401" in str(e):
            logger.warning(f"Invalid API key detected: {e}. Rotating to next key...")
            _current_key_index = (_current_key_index + 1) % len(keys)
            # Raise a retryable error to trigger tenacity
            raise APIConnectionError(request=None) 
        else:
            logger.error(f"Groq API Error: {e}", exc_info=True)
            raise ServiceException(f"Groq API failed: {str(e)}")
