from typing import Any
from urllib.parse import urljoin
import httpx
from bs4 import BeautifulSoup
from bs4.element import AttributeValueList


class ThumbnailExtractor:
    @staticmethod
    async def extract(url: str) -> None | str:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                html = response.text
            except Exception as e:
                print(f"Fetch error {url}: {e}")
                return None
        soup = BeautifulSoup(html, 'html.parser')
        meta_tags = [
            {"property": "og:image"},
            {"name": "twitter:image"},
            {"property": "twitter:image:src"}
        ]
        for tag_attr in meta_tags:
            meta = soup.find("meta", **tag_attr)
            if meta and meta.get("content"):
                return meta["content"]
        for img in soup.find_all('img'):
            src = img.get('src')
            data_src = img.get('data-src') or img.get('data-original')
            target_src = data_src if data_src else src
            if not target_src:
                continue
            absolute_url = urljoin(url, target_src)
            if ThumbnailExtractor._is_valid_image(absolute_url):
                return absolute_url
        return None
    @staticmethod
    def _is_valid_image(url: str) -> bool:
        url_lower = url.lower()
        if url_lower.startswith("data:image"):
            return False
        ignored_extensions = ['.svg', '.ico', '.cur']
        if any(url_lower.endswith(ext) for ext in ignored_extensions):
            return False
        ignored_keywords = ['logo', 'icon', 'pixel', 'avatar']
        return True
