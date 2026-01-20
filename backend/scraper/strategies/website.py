from ..base import ContentScraper, ScrapedContent
from ..extractors.text_exctractor import TextExtractor
from ..extractors.thumbnail_extractor import ThumbnailExtractor


class WebsiteScraper(ContentScraper):
    async def can_handle(self, url: str) -> bool:
        return True

    async def scrape(self, url: str) -> ScrapedContent:
        text_content = await TextExtractor.extract(url)
        if not text_content:
            raise ValueError("No content could be extracted from the URL")

        thumbnail = await ThumbnailExtractor.extract(url)

        return ScrapedContent(
            text=text_content,
            metadata={"type": "website", "thumbnail": thumbnail}
        )
