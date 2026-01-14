import trafilatura
from typing import Optional

class TextExtractor:
    @staticmethod
    async def extract(url: str) -> Optional[str]:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            return trafilatura.extract(downloaded)
        return None
