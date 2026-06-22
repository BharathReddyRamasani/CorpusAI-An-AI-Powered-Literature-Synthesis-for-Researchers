import logging
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
import tempfile
import os
from pathlib import Path
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception
from urllib.error import URLError, HTTPError

logger = logging.getLogger("app")

ARXIV_API_URL = "http://export.arxiv.org/api/query"

def _is_retryable_exception(exception):
    if isinstance(exception, HTTPError):
        return exception.code in (429, 500, 502, 503, 504)
    if isinstance(exception, URLError) or isinstance(exception, TimeoutError):
        return True
    return False

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1.5, min=4, max=30),
    retry=retry_if_exception(_is_retryable_exception),
    reraise=True
)
def _do_arxiv_request(url: str, timeout: int = 30) -> bytes:
    """Helper method to make a request to ArXiv with retries."""
    req = urllib.request.Request(url, headers={'User-Agent': 'AI-Research-Assistant/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read()
    except HTTPError as e:
        if e.code in (429, 500, 502, 503, 504):
            logger.warning(f"ArXiv API returned {e.code}, retrying...")
            raise e
        logger.error(f"ArXiv API HTTP Error {e.code}: {e}")
        raise e
    except (URLError, TimeoutError) as e:
        logger.warning(f"ArXiv API network error: {e}, retrying...")
        raise e

def search_arxiv(query: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Search ArXiv for papers matching the query.
    """
    try:
        # ArXiv API uses 'search_query=all:...'
        # Let's replace spaces with + for the query
        safe_query = urllib.parse.quote(query.replace(" ", "+"))
        url = f"{ARXIV_API_URL}?search_query=all:{safe_query}&max_results={max_results}&sortBy=relevance&sortOrder=descending"
        
        logger.info(f"Querying ArXiv API: {url}")
        
        xml_data = _do_arxiv_request(url, timeout=30)
            
        root = ET.fromstring(xml_data)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        results = []
        for entry in root.findall('atom:entry', ns):
            title = entry.find('atom:title', ns).text
            if title:
                title = title.replace('\n', ' ').strip()
                
            summary = entry.find('atom:summary', ns).text
            if summary:
                summary = summary.replace('\n', ' ').strip()
                
            published = entry.find('atom:published', ns).text
            
            authors = []
            for author in entry.findall('atom:author', ns):
                name = author.find('atom:name', ns).text
                if name:
                    authors.append(name)
                    
            # Find the PDF link
            pdf_url = ""
            for link in entry.findall('atom:link', ns):
                if link.attrib.get('title') == 'pdf':
                    pdf_url = link.attrib.get('href')
                    break
            
            # Fallback if title='pdf' isn't explicitly set but it's a pdf mime type
            if not pdf_url:
                for link in entry.findall('atom:link', ns):
                    if link.attrib.get('type') == 'application/pdf':
                        pdf_url = link.attrib.get('href')
                        break

            results.append({
                "title": title,
                "summary": summary,
                "authors": authors,
                "published": published,
                "pdf_url": pdf_url
            })
            
        return results
    except Exception as e:
        logger.error(f"ArXiv search failed: {e}", exc_info=True)
        return []

def download_arxiv_pdf(pdf_url: str, title: str) -> Path:
    """
    Download a PDF from ArXiv and save it to a temporary file.
    Returns the path to the temporary file.
    """
    try:
        if not pdf_url.endswith('.pdf'):
            pdf_url += '.pdf'
            
        logger.info(f"Downloading ArXiv PDF: {pdf_url}")
        
        # Create a safe filename from the title
        safe_title = "".join([c if c.isalnum() else "_" for c in title])
        safe_title = safe_title[:50] + ".pdf"
        
        temp_dir = tempfile.gettempdir()
        file_path = Path(temp_dir) / safe_title
        
        pdf_data = _do_arxiv_request(pdf_url, timeout=30)
        with open(file_path, 'wb') as f:
            f.write(pdf_data)
                
        return file_path
    except Exception as e:
        logger.error(f"ArXiv download failed: {e}", exc_info=True)
        raise Exception(f"Failed to download ArXiv PDF: {e}")
