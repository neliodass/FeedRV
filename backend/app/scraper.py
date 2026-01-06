import trafilatura
from youtube_transcript_api import YouTubeTranscriptApi
import re
def get_video_id(youtube_url: str) -> str:

    reg = r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})'
    match = re.search(reg, youtube_url)
    if match:
        return match.group(1)
    else:
        return None
async def scrape_content(url:str )-> str:
    if "youtube.com" in url or "youtu.be" in url:
        video_id = get_video_id(url)
        if not video_id:
            raise ValueError("Invalid YouTube URL")
        if video_id:
            try:
                ytt_api = YouTubeTranscriptApi()
                transcript_list = ytt_api.fetch(video_id=video_id)
                return " ".join([entry.text for entry in transcript_list.snippets])
            except Exception as e:
                return f"Error fetching transcript for video ID: {str(e)}"
    downloaded = trafilatura.fetch_url(url)
    if downloaded:
        content = trafilatura.extract(downloaded)
        if content:
            return content
    return "No content could be extracted from the URL."