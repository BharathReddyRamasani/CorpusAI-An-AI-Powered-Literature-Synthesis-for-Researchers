"""
Services — URL Extraction Service
Extracts main article text from a URL using trafilatura.
"""

import logging
from typing import Optional
import urllib.parse
import urllib.request
from html.parser import HTMLParser

from app.utils.exceptions import BadRequestException, ServiceException

logger = logging.getLogger("app")


def extract_url_content(url: str) -> tuple[str, str]:
    """
    Downloads and extracts text from a given URL using trafilatura.
    Returns: (title, full_text)
    """
    try:
        import trafilatura
        has_trafilatura = True
    except ImportError as e:
        logger.warning(f"trafilatura import failed: {e}. Falling back to BeautifulSoup.")
        has_trafilatura = False

    # Basic URL validation
    parsed = urllib.parse.urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        raise BadRequestException("Invalid URL format.")
    if parsed.scheme not in ["http", "https"]:
        raise BadRequestException("Only HTTP and HTTPS URLs are supported.")

    logger.info(f"Downloading URL content: {url}")
    
    if has_trafilatura:
        # Download HTML
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            raise BadRequestException(f"Failed to download content from {url}. The site may be blocking access or the URL is invalid.")

        # Extract clean text and metadata
        metadata = trafilatura.extract_metadata(downloaded)
        title = metadata.title if metadata and metadata.title else parsed.netloc

        text = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=True,
            include_links=False
        )
    else:
        # Dependency-free Fallback using standard library

        class TextExtractor(HTMLParser):
            def __init__(self):
                super().__init__()
                self.text = []
                self.title = ""
                self._in_title = False
                self._ignore = False
                self._ignore_tags = {'script', 'style', 'head', 'nav', 'footer', 'header'}

            def handle_starttag(self, tag, attrs):
                if tag in self._ignore_tags:
                    self._ignore = True
                if tag == 'title':
                    self._in_title = True

            def handle_endtag(self, tag):
                if tag in self._ignore_tags:
                    self._ignore = False
                if tag == 'title':
                    self._in_title = False

            def handle_data(self, data):
                if self._in_title:
                    self.title += data
                elif not self._ignore:
                    clean = data.strip()
                    if clean:
                        self.text.append(clean)

        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                html_bytes = response.read()
                # Simple decode trying utf-8
                html_str = html_bytes.decode('utf-8', errors='ignore')
                
            parser = TextExtractor()
            parser.feed(html_str)
            title = parser.title.strip() if parser.title else parsed.netloc
            text = ' '.join(parser.text)
        except Exception as e:
            logger.error(f"Standard library extraction failed: {e}")
            raise BadRequestException(f"Failed to download content from {url}: {str(e)}")

    if not text:
        raise BadRequestException(f"Could not extract meaningful text from {url}. It might be an image, PDF, or heavily JavaScript-rendered page.")

    return title, text
