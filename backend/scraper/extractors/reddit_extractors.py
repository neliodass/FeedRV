from typing import Optional, List, Any
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode
import httpx


class RedditJsonFetcher:
    async def fetch(self, url: str) -> List[Any]:
        parsed = urlparse(url)

        path = parsed.path.rstrip('/')
        if not path.endswith('.json'):
            path += '.json'

        query_params = parse_qs(parsed.query) if parsed.query else {}
        query_params['raw_json'] = ['1']
        query_string = urlencode(query_params, doseq=True)

        json_url = urlunparse((
            parsed.scheme,
            parsed.netloc,
            path,
            parsed.params,
            query_string,
            parsed.fragment
        ))

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        print(f"Fetching Reddit JSON from: {json_url}")

        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            response = await client.get(json_url, headers=headers)
            response.raise_for_status()

            content_type = response.headers.get('content-type', '')
            if 'application/json' not in content_type:
                print(f"Reddit returned non-JSON content: {content_type}")
                print(f"First 500 chars: {response.text[:500]}")
                raise ValueError(f"Reddit did not return JSON. Content-Type: {content_type}")

            try:
                return response.json()
            except Exception as e:
                print(f"Failed to parse Reddit JSON response")
                print(f"URL: {json_url}")
                print(f"Status: {response.status_code}")
                print(f"Content preview: {response.text[:500]}")
                raise


class RedditContentExtractor:
    def extract(self, json_data: List[Any]) -> str:
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
    def extract(self, json_data: List[Any]) -> dict:
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
        if thumbnail:
            return thumbnail

        preview = post_data.get('preview', {})
        images = preview.get('images', [])
        if images:
            source = images[0].get('source', {})
            return source.get('url')

        return None

