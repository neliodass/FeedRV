from urllib.parse import urljoin
import trafilatura
from bs4 import BeautifulSoup


class ImageExtractor:
    @staticmethod
    async def extract(url: str) -> list[str]:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return []

        soup = BeautifulSoup(downloaded, 'html.parser')
        images = []

        for img in soup.find_all('img'):
            src = img.get('src')
            if src:
                absolute_url = urljoin(url, src)
                images.append(absolute_url)

        return images
