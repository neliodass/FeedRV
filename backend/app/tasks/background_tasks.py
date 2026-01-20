import asyncio
from sqlmodel import select, Session as SQLSession

from app.database import engine
from app.models import Item, Tag
from app.services import process_new_link
from scraper.scraper_factory import ScraperFactory


async def process_item_with_retry(
        item_id: int,
        url: str,
        max_retries: int = 3,
        initial_delay: float = 2.0
):
    factory = ScraperFactory()

    for attempt in range(max_retries):
        with SQLSession(engine) as session:
            try:
                if attempt == 0:
                    item = session.get(Item, item_id)
                    if item:
                        item.status = 'processing'
                        session.add(item)
                        session.commit()

                scraped_content = await factory.scrape(url)
                ai_data, embedding = await process_new_link(
                    url,
                    scraped_content.text[:5000],
                    scraped_content
                )

                item = session.get(Item, item_id)
                if not item:
                    print(f"Item {item_id} not found in database")
                    return

                item.title = ai_data.title
                item.summary = ai_data.summary
                item.source_type = ai_data.source_type
                item.creator = ai_data.creator
                item.priority = ai_data.priority
                item.embedding = embedding
                item.consumed_at = None
                item.status = 'completed'
                if ai_data.image_url and ai_data.image_url.strip():
                    item.image_url = ai_data.image_url
                elif scraped_content.thumbnail:
                    item.image_url = scraped_content.thumbnail
                item.item_metadata = scraped_content.extra_metadata

                for tag_name in ai_data.tags:
                    tag = session.exec(select(Tag).where(Tag.name == tag_name)).first()
                    if not tag:
                        tag = Tag(name=tag_name)
                    item.tags.append(tag)

                session.add(item)
                session.commit()

                print(f"Item {item_id} processed successfully on attempt {attempt + 1}/{max_retries}")
                return

            except Exception as e:
                error_msg = f"Error processing item {item_id} (attempt {attempt + 1}/{max_retries}): {str(e)}"
                print(error_msg)
                if attempt == max_retries - 1:
                    try:
                        item = session.get(Item, item_id)
                        if item:
                            session.delete(item)
                            session.commit()
                        print(f"Item {item_id} marked as failed after {max_retries} attempts")
                    except Exception as db_error:
                        print(f"Failed to update item status: {str(db_error)}")
                else:
                    # Exponential backoff: 2s, 4s, 8s
                    delay = initial_delay * (2 ** attempt)
                    print(f"↻ Retrying in {delay}s...")
                    await asyncio.sleep(delay)
