from .base import ContentScraper
from .strategies.youtube import YouTubeScraper
from .strategies.website import WebsiteScraper
class ScraperFactory:
    def __init__(self):
        self.scrapers: list[ContentScraper] = [
            YouTubeScraper(),
            WebsiteScraper(),
        ]

    def register_scraper(self, scraper: ContentScraper):
        self.scrapers.insert(0, scraper)

    async def get_scraper(self, url: str) -> ContentScraper:
        for scraper in self.scrapers:
            if await scraper.can_handle(url):
                return scraper
        raise ValueError("No suitable scraper found for this URL")

    async def scrape(self, url: str):
        scraper = await self.get_scraper(url)
        return await scraper.scrape(url)