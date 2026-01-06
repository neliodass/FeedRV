from botocore.configloader import raw_config_parse
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlmodel import select, Session as SQLSession
from typing import List

from app.database import init_db, get_session, engine
from app.models import Item, Tag, ItemTagLink,ItemPublic
from app.scraper import scrape_content
from app.services import process_new_link

from contextlib import asynccontextmanager
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
app = FastAPI(title="FeedRV API",lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Hello from FeedRV Backend!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
@app.post("/items/", response_model=ItemPublic)
async def create_item(url: str, session: SQLSession = Depends(get_session)):
    existing_item = session.exec(select(Item).where(Item.url == url)).first()
    if existing_item:
        raise HTTPException(status_code=400, detail="Ten link został już zapisany.")

    try:
        raw_content = await scrape_content(url)
        ai_data, embedding = await process_new_link(url, raw_content[:5000])
        new_item = Item(
            url=url,
            title=ai_data.title,
            summary=ai_data.summary,
            source_type=ai_data.source_type,
            priority=ai_data.priority,
            embedding=embedding
        )
        for tag_name in ai_data.tags:
            tag = session.exec(select(Tag).where(Tag.name == tag_name)).first()
            if not tag:
                tag = Tag(name=tag_name)
            new_item.tags.append(tag)

        session.add(new_item)
        session.commit()
        session.refresh(new_item)
        return new_item

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Błąd przetwarzania AI: {str(e)}")

@app.get("/items/", response_model=List[ItemPublic])
async def read_items(session: SQLSession = Depends(get_session)):
    items = session.exec(select(Item)).all()
    return items
