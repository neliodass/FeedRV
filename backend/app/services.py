import os
from typing import Dict

import httpx

from app.agent import agent
from scraper.base import ScrapedContent

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

async def get_embedding(text: str) -> list[float]:
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

async def process_new_link(url: str, raw_content: str, scraped_data: ScrapedContent) -> tuple:
    prompt_parts = [f"Analyze the following link content: {raw_content}", f"URL: {url}"]

    if scraped_data.title:
        prompt_parts.append(f"Existing Title: {scraped_data.title}")
    if scraped_data.author:
        prompt_parts.append(f"Author/Creator: {scraped_data.author}")
    if scraped_data.thumbnail:
        prompt_parts.append(f"Thumbnail URL: {scraped_data.thumbnail}")
    if scraped_data.extra_metadata:
        prompt_parts.append(f"Additional Metadata: {scraped_data.extra_metadata}")

    result = await agent.run("\n".join(prompt_parts))
    data = result.output
    text_to_embed = f"{data.title}\n{data.creator}\n{data.summary}\n{' '.join(data.tags)}"
    embedding = await get_embedding(text_to_embed)
    return data, embedding


