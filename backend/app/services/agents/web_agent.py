"""
Agents — Web Search Agent
Performs live web searches using DuckDuckGo and Trafilatura to extract
clean text from articles, then synthesizes an answer using the Groq API.
"""

import logging
import httpx
import re
import trafilatura
from urllib.parse import unquote

from app.utils.groq_client import call_groq_api_with_rotation
from app.utils.exceptions import ServiceException

logger = logging.getLogger("app")

async def search_duckduckgo(query: str, max_results: int = 3) -> list[str]:
    """Scrape duckduckgo HTML for links."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://html.duckduckgo.com/html/",
                data={"q": query},
                headers=headers,
                timeout=10.0
            )
            res.raise_for_status()
            
            # Extract links using simple regex to avoid BS4 dependency issues
            links = []
            for match in re.finditer(r'class="result__url"\s+href="([^"]+)"', res.text):
                url = match.group(1)
                if url.startswith("//duckduckgo.com/l/?uddg="):
                    # Clean up DDG redirect URL
                    clean_url = unquote(url.split("uddg=")[1].split("&")[0])
                    if clean_url not in links:
                        links.append(clean_url)
                else:
                    if url not in links:
                        links.append(url)
                
                if len(links) >= max_results:
                    break
            
            return links
    except Exception as e:
        logger.error(f"[Web Agent] Failed to search DuckDuckGo: {e}")
        return []

async def fetch_and_extract_text(url: str) -> str:
    """Download and extract clean text from a URL using Trafilatura."""
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url, timeout=8.0, follow_redirects=True)
            res.raise_for_status()
            text = trafilatura.extract(res.text, include_comments=False, include_tables=False)
            return text if text else ""
    except Exception as e:
        logger.warning(f"[Web Agent] Failed to extract {url}: {e}")
        return ""

async def run(question: str) -> dict:
    """Run the Web Search Agent."""
    logger.info(f"[Web Agent] Searching web for: {question}")
    
    # 1. Search the web for the question
    # We ask Groq to generate an optimal search query first
    query_prompt = f"Convert the following user question into a short, effective Google search query (maximum 5 words). Return ONLY the search query string, nothing else.\n\nQuestion: {question}"
    search_query = await call_groq_api_with_rotation(query_prompt, "You are a web search assistant.")
    search_query = search_query.replace('"', '').strip()
    
    logger.info(f"[Web Agent] Optimized query: {search_query}")
    
    # 2. Get links
    links = await search_duckduckgo(search_query, max_results=3)
    if not links:
        raise ServiceException("Failed to find relevant web results.")
        
    logger.info(f"[Web Agent] Found links: {links}")
    
    # 3. Extract text from links
    extracted_texts = []
    sources = []
    import asyncio
    tasks = [fetch_and_extract_text(url) for url in links]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for url, text in zip(links, results):
        if isinstance(text, str) and len(text) > 100:
            extracted_texts.append(f"SOURCE: {url}\n{text[:2000]}") # limit to 2000 chars per source
            sources.append(url)
            
    if not extracted_texts:
        raise ServiceException("Failed to extract content from the search results.")
        
    # 4. Synthesize final answer
    context = "\n\n---\n\n".join(extracted_texts)
    
    system_prompt = """You are a highly capable AI Web Research Agent. 
You will be provided with live text extracted from the internet to answer a user's question.
Synthesize the answer beautifully using markdown. 
Whenever you state a fact from the text, add an inline citation like [1], [2], etc., referring to the source URLs provided."""

    user_prompt = f"""User Question: {question}

Web Context:
{context}

Please provide a comprehensive answer based ONLY on the context provided above.
"""

    answer = await call_groq_api_with_rotation(user_prompt, system_prompt)
    
    return {
        "answer": answer,
        "sources": sources
    }
