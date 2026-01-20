from typing import Optional
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
import trafilatura


class WebsiteTextExtractor:
    async def extract(self, url: str) -> str:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            raise ValueError("Could not fetch URL content")

        extracted = trafilatura.extract(downloaded)
        if not extracted:
            raise ValueError("Could not extract text from URL")

        return extracted


class WebsiteMetadataExtractor:
    async def extract(self, url: str) -> dict:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            html = response.text

        soup = BeautifulSoup(html, 'html.parser')

        title = self._extract_title(soup)
        author = self._extract_author(soup)
        thumbnail = self._extract_thumbnail(soup, url)

        parsed_url = urlparse(url)
        domain = parsed_url.netloc

        return {
            'title': title,
            'author': author,
            'thumbnail': thumbnail,
            'domain': domain,
        }

    def _extract_title(self, soup: BeautifulSoup) -> Optional[str]:
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            return og_title["content"]

        twitter_title = soup.find("meta", attrs={"name": "twitter:title"})
        if twitter_title and twitter_title.get("content"):
            return twitter_title["content"]

        title_tag = soup.find("title")
        if title_tag:
            return title_tag.get_text().strip()

        return None

    def _extract_author(self, soup: BeautifulSoup) -> Optional[str]:
        author_meta = soup.find("meta", attrs={"name": "author"})
        if author_meta and author_meta.get("content"):
            return author_meta["content"]

        og_author = soup.find("meta", property="article:author")
        if og_author and og_author.get("content"):
            return og_author["content"]

        return None

    def _extract_thumbnail(self, soup: BeautifulSoup, base_url: str) -> Optional[str]:
        from urllib.parse import urljoin

        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            return og_image["content"]

        twitter_image = soup.find("meta", attrs={"name": "twitter:image"})
        if twitter_image and twitter_image.get("content"):
            return twitter_image["content"]

        twitter_image_src = soup.find("meta", property="twitter:image:src")
        if twitter_image_src and twitter_image_src.get("content"):
            return twitter_image_src["content"]

        for img in soup.find_all('img'):
            src = img.get('src')
            data_src = img.get('data-src') or img.get('data-original')
            target_src = data_src if data_src else src

            if not target_src:
                continue

            absolute_url = urljoin(base_url, target_src)
            if self._is_valid_image(absolute_url):
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
        return True

