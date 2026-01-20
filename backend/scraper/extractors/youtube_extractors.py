import re
import requests
from youtube_transcript_api import YouTubeTranscriptApi


class YouTubeIdentifierExtractor:
    @staticmethod
    def extract(url: str) -> str:
        pattern = r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})'
        match = re.search(pattern, url)
        if not match:
            raise ValueError("Invalid YouTube URL")
        return match.group(1)


class YouTubeTranscriptExtractor:
    async def extract(self, video_id: str) -> str:
        ytt_api = YouTubeTranscriptApi()
        transcript_list = ytt_api.fetch(video_id=video_id, languages=["en", "pl"])
        return " ".join([entry.text for entry in transcript_list.snippets])


class YouTubeMetadataExtractor:
    OEMBED_ENDPOINT = "https://www.youtube.com/oembed"

    async def extract(self, url: str) -> dict:
        params = {"url": url, "format": "json"}
        response = requests.get(self.OEMBED_ENDPOINT, params=params)
        response.raise_for_status()
        data = response.json()

        return {
            'title': data.get('title'),
            'author': data.get('author_name'),
            'thumbnail': data.get('thumbnail_url'),
        }

