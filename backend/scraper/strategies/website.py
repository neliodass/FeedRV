from ..base import ContentScraper, ScrapedContent
from ..extractors.website_extractors import (
    WebsiteTextExtractor,
    WebsiteMetadataExtractor
)


class WebsiteScraper(ContentScraper):
    def __init__(
        self,
        text_extractor: WebsiteTextExtractor = None,
        metadata_extractor: WebsiteMetadataExtractor = None
    ):
        self.text_extractor = text_extractor or WebsiteTextExtractor()
        self.metadata_extractor = metadata_extractor or WebsiteMetadataExtractor()

    async def can_handle(self, url: str) -> bool:
        return True

    async def scrape(self, url: str) -> ScrapedContent:
        text = await self.text_extractor.extract(url)
        metadata = await self.metadata_extractor.extract(url)

        return ScrapedContent(
            text=text,
            title=metadata.get('title'),
            author=metadata.get('author'),
            thumbnail=metadata.get('thumbnail'),
            extra_metadata={
                'type': 'website',
                'domain': metadata.get('domain')
            }
        )


