import os
import httpx

from app.agent import agent

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

async def process_new_link(url: str, raw_content:str)-> tuple:
    result = await agent.run(f"Analyze the following link content: {raw_content} \n URL: {url}")
    data = result.output
    text_to_embed = f"{data.title}\n{data.summary}\n{' '.join(data.tags)}"
    embedding = await get_embedding(text_to_embed)
    return data, embedding


