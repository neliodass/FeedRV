from ..base import ContentScraper, ScrapedContent
from ..extractors.youtube_extractors import (
    YouTubeIdentifierExtractor,
    YouTubeTranscriptExtractor,
    YouTubeMetadataExtractor
)


class YouTubeScraper(ContentScraper):
    def __init__(
        self,
        identifier_extractor: YouTubeIdentifierExtractor = None,
        transcript_extractor: YouTubeTranscriptExtractor = None,
        metadata_extractor: YouTubeMetadataExtractor = None
    ):
        self.identifier_extractor = identifier_extractor or YouTubeIdentifierExtractor()
        self.transcript_extractor = transcript_extractor or YouTubeTranscriptExtractor()
        self.metadata_extractor = metadata_extractor or YouTubeMetadataExtractor()

    async def can_handle(self, url: str) -> bool:
        return "youtube.com" in url or "youtu.be" in url

    async def scrape(self, url: str) -> ScrapedContent:
        video_id = self.identifier_extractor.extract(url)

        transcript = await self.transcript_extractor.extract(video_id)
        metadata = await self.metadata_extractor.extract(url)

        return ScrapedContent(
            text=transcript,
            title=metadata['title'],
            author=metadata['author'],
            thumbnail=metadata['thumbnail'],
            extra_metadata={
                'type': 'youtube',
                'video_id': video_id
            }
        )

