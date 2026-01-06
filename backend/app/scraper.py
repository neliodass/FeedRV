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
async def scrape_text(url: str) -> str|None:
    downloaded = trafilatura.fetch_url(url)
    if downloaded:
        content = trafilatura.extract(downloaded)
        if content:
            return content
        else: return None
    return None
async def scrape_content(url:str )-> str:
    if "youtube.com" in url or "youtu.be" in url:
        video_id = get_video_id(url)
        if not video_id:
            raise ValueError("Invalid YouTube URL")
        if video_id:
            try:
                ytt_api = YouTubeTranscriptApi()
                transcript_list = ytt_api.fetch(video_id=video_id,languages=["en","pl"])
                transcript = " ".join([entry.text for entry in transcript_list.snippets])
                text_content = await scrape_text(url)
                if text_content:
                    return text_content+transcript
                return transcript
            except Exception as e:
                return f"Error fetching transcript for video ID: {str(e)}"
    else:
        text_content = await scrape_text(url)
        if text_content:
            return text_content
        return "No content could be extracted from the URL."