from typing import Optional
import httpx


class RedditJsonFetcher:
    async def fetch(self, url: str) -> dict:
        json_url = url.rstrip('/') + '.json'
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            response = await client.get(json_url, headers=headers)
            response.raise_for_status()
            return response.json()


class RedditContentExtractor:
    def extract(self, json_data: list) -> str:
        post_data = json_data[0]['data']['children'][0]['data']
        content_parts = []

        selftext = post_data.get('selftext', '').strip()
        if selftext:
            content_parts.append(f"Post: {selftext}")

        if len(json_data) > 1:
            comments = json_data[1]['data']['children']
            top_comments = []

            for comment in comments:
                if comment['kind'] == 't1':
                    comment_body = comment['data'].get('body', '').strip()
                    if comment_body and comment_body != '[deleted]' and comment_body != '[removed]':
                        top_comments.append(comment_body)
                        if len(top_comments) >= 5:
                            break

            if top_comments:
                content_parts.append("\n\nTop Comments:")
                for i, comment in enumerate(top_comments, 1):
                    content_parts.append(f"{i}. {comment}")

        return "\n".join(content_parts) if content_parts else post_data.get('title', '')


class RedditMetadataExtractor:
    def extract(self, json_data: list) -> dict:
        post_data = json_data[0]['data']['children'][0]['data']

        return {
            'title': post_data.get('title'),
            'author': post_data.get('author'),
            'subreddit': post_data.get('subreddit'),
            'score': post_data.get('score', 0),
            'thumbnail': self._get_thumbnail(post_data),
            'created_utc': post_data.get('created_utc'),
            'post_hint': post_data.get('post_hint'),
            'url': post_data.get('url'),
        }

    def _get_thumbnail(self, post_data: dict) -> Optional[str]:
        thumbnail = post_data.get('thumbnail')
        if thumbnail and thumbnail not in ['self', 'default', 'nsfw', 'spoiler', '']:
            return thumbnail

        preview = post_data.get('preview', {})
        images = preview.get('images', [])
        if images:
            source = images[0].get('source', {})
            return source.get('url')

        return None

