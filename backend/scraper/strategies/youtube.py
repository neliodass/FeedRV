import re

import requests
from youtube_transcript_api import YouTubeTranscriptApi
from ..base import ContentScraper, ScrapedContent
from ..extractors.text_exctractor import TextExtractor


class YouTubeScraper(ContentScraper):
    VIDEO_ID_REGEX = r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})'
    YOUTUBE_OEMBED_ENDPOINT = "https://www.youtube.com/oembed"

    async def can_handle(self, url: str) -> bool:
        return "youtube.com" in url or "youtu.be" in url

    def _extract_video_id(self, url: str) -> str:
        match = re.search(self.VIDEO_ID_REGEX, url)
        if not match:
            raise ValueError("Invalid YouTube URL")
        return match.group(1)

    async def scrape(self, url: str) -> ScrapedContent:
        video_id = self._extract_video_id(url)

        try:
            ytt_api = YouTubeTranscriptApi()
            transcript_list = ytt_api.fetch(video_id=video_id, languages=["en", "pl"])
            transcript = " ".join([entry.text for entry in transcript_list.snippets])
        except Exception as e:
            raise Exception(f"Error fetching transcript: {str(e)}")

        try:
            params = {
                "url": url,
                "format": "json"
            }
            response = requests.get(self.YOUTUBE_OEMBED_ENDPOINT,params=params)
            data = response.json()
        except Exception as e:
            raise Exception(f"Error fetching oEmbed data: {str(e)}")

        text_content = await TextExtractor.extract(url) or ""
        images = [data['thumbnail_url']]
        author = data['author_name']
        title = data['title']


        return ScrapedContent(
            text=text_content + " " + transcript,
            images=images,
            metadata={"video_id": video_id, "type": "youtube", "author": author, "title": title}
        )