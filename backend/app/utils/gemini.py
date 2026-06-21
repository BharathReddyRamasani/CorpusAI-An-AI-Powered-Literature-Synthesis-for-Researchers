import logging
import asyncio
from google.api_core.exceptions import ResourceExhausted, InvalidArgument
import google.generativeai as genai

from app.config import settings
from app.utils.exceptions import ServiceException

logger = logging.getLogger("app")

_current_key_index = 0
_model_cache: dict = {}

def _get_api_keys() -> list[str]:
    try:
        return settings.gemini_keys_list
    except ValueError:
        return []

def _get_cached_model(api_key: str, model_name: str, system_prompt: str):
    cache_key = (api_key, model_name)
    if cache_key not in _model_cache:
        # CRITICAL FIX: client_options={'api_key': ...} forces gRPC
        # which correctly accepts AQ. keys! REST rejects them.
        genai.configure(client_options={'api_key': api_key})
            
        _model_cache[cache_key] = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_prompt,
        )
        logger.debug(f"[Gemini] Cached new model instance for key ...{api_key[-4:]}")
    return _model_cache[cache_key]

async def call_gemini_api_with_rotation(prompt: str, system_prompt: str) -> str:
    global _current_key_index
    keys = _get_api_keys()
    
    if not keys:
        raise ServiceException("No Gemini API keys configured.")

    model_name = settings.gemini_model
    attempts = 0
    max_attempts = len(keys) * 2
    
    while attempts < max_attempts:
        current_key = keys[_current_key_index % len(keys)]
        
        try:
            model = _get_cached_model(current_key, model_name, system_prompt)
            response = await model.generate_content_async(prompt)
            
            if getattr(response, "candidates", None) and response.candidates:
                content = response.candidates[0].content
                if content and getattr(content, "parts", None):
                    return "".join(getattr(p, "text", "") for p in content.parts)
            return getattr(response, "text", str(response))
            
        except (ResourceExhausted, InvalidArgument) as e:
            logger.warning(f"Key {_current_key_index + 1}/{len(keys)} hit error ({type(e).__name__}). Rotating to next key...")
            _current_key_index = (_current_key_index + 1) % len(keys)
            attempts += 1
            
            if attempts >= len(keys):
                sleep_time = min(5, 1.5 ** (attempts - len(keys)))
                logger.info(f"All keys exhausted, sleeping for {sleep_time:.1f}s before retrying...")
                await asyncio.sleep(sleep_time)
            
        except Exception as e:
            logger.error(f"Gemini API Error: {e}", exc_info=True)
            raise ServiceException(f"Gemini API failed: {str(e)}")

    logger.error("All Gemini API keys exhausted.")
    raise ServiceException("All Gemini API keys are currently unavailable.")
