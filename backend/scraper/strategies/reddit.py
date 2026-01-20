from scraper.base import ContentScraper, ScrapedContent
from scraper.extractors.reddit_extractors import (
    RedditJsonFetcher,
    RedditContentExtractor,
    RedditMetadataExtractor
)


class RedditScraper(ContentScraper):
    def __init__(
        self,
        json_fetcher: RedditJsonFetcher = None,
        content_extractor: RedditContentExtractor = None,
        metadata_extractor: RedditMetadataExtractor = None
    ):
        self.json_fetcher = json_fetcher or RedditJsonFetcher()
        self.content_extractor = content_extractor or RedditContentExtractor()
        self.metadata_extractor = metadata_extractor or RedditMetadataExtractor()

    async def can_handle(self, url: str) -> bool:
        return "reddit.com" in url or "redd.it" in url

    async def scrape(self, url: str) -> ScrapedContent:
        json_data = await self.json_fetcher.fetch(url)

        text = self.content_extractor.extract(json_data)
        metadata = self.metadata_extractor.extract(json_data)

        return ScrapedContent(
            text=text,
            title=metadata['title'],
            author=metadata['author'],
            thumbnail=metadata['thumbnail'],
            extra_metadata={
                'type': 'reddit',
                'subreddit': metadata['subreddit'],
                'score': metadata['score'],
                'post_hint': metadata['post_hint'],
                'created_utc': metadata['created_utc'],
            }
        )



