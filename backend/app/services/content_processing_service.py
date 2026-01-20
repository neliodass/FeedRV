from typing import Tuple
from app.agent import agent
from app.services.embedding_service import get_embedding
from scraper.base import ScrapedContent


async def process_new_link(url: str, raw_content: str, scraped_data: ScrapedContent) -> Tuple:
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

