from .base import ContentScraper
from .strategies.youtube import YouTubeScraper
from .strategies.reddit import RedditScraper
from .strategies.website import WebsiteScraper


class ScraperFactory:
    def __init__(self):
        self.scrapers: list[ContentScraper] = [
            YouTubeScraper(),
            RedditScraper(),
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
        last_exception = None

        for scraper in self.scrapers:
            if await scraper.can_handle(url):
                try:
                    return await scraper.scrape(url)
                except Exception as e:
                    print(f"{scraper.__class__.__name__} failed for {url}: {str(e)}")
                    last_exception = e
                    continue

        if last_exception:
            raise last_exception
        raise ValueError("No suitable scraper found for this URL")
