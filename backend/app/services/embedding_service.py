import os
from typing import List
import httpx

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")


async def get_embedding(text: str) -> List[float]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"
    headers = {
        "Content-Type": "application/json",
    }
    json_data = {
        "model": "models/text-embedding-004",
        "content": {
            "parts": [
                {
                    "text": text
                }
            ]
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=json_data)
        response.raise_for_status()
        data = response.json()
        embedding = data["embedding"]["values"]
        return embedding

