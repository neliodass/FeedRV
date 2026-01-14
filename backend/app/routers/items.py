from typing import List, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import select, Session as SQLSession

from app.auth import get_current_active_user
from app.database import get_session, engine
from app.models import Item, Tag, ItemPublic, User, ItemUpdate
from app.services import process_new_link, get_embedding
from datetime import datetime, UTC
from scraper.scraper_factory import ScraperFactory

router = APIRouter(prefix="/items", tags=["items"])


async def process_item_in_background(item_id: int, url: str):
    factory = ScraperFactory()
    with SQLSession(engine) as session:
        try:
            raw_content = await factory.scrape(url)
            ai_data, embedding = await process_new_link(url, raw_content[:5000])

            item = session.get(Item, item_id)
            item.title = ai_data.title
            item.summary = ai_data.summary
            item.source_type = ai_data.source_type
            item.creator = ai_data.creator
            item.priority = ai_data.priority
            item.embedding = embedding
            item.consumed_at = None
            item.status = 'completed'
            for tag_name in ai_data.tags:
                tag = session.exec(select(Tag).where(Tag.name == tag_name)).first()
                if not tag:
                    tag = Tag(name=tag_name)
                item.tags.append(tag)

            session.add(item)
            session.commit()
        except Exception as e:
            item = session.get(Item, item_id)
            item.status = 'failed'
            session.add(item)
            session.commit()
            print(f"Error processing item {item_id} in background: {str(e)}")


@router.post("/", response_model=ItemPublic)
async def create_item(
    url: str,
    background_tasks: BackgroundTasks,
    session: SQLSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    existing_item = session.exec(select(Item).where(Item.url == url)).first()
    if existing_item:
        raise HTTPException(status_code=400, detail="Ten link został już zapisany.")

    new_item = Item(
        url=url,
        title="Analyzing...",
        summary="AI analysis in progress...",
        source_type="pending",
        creator="pending",
        priority=1,
        user_id=current_user.id
    )
    session.add(new_item)
    session.commit()
    session.refresh(new_item)

    background_tasks.add_task(process_item_in_background, new_item.id, url)
    return new_item


@router.get("/", response_model=List[ItemPublic])
async def read_items(
    items_per_batch: int = 10,
    page: int = 1,
    include_consumed: bool = False,
    session: SQLSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    offset = (page - 1) * items_per_batch
    statement = select(Item).where(Item.user_id == current_user.id)

    if not include_consumed:
        statement = statement.where(Item.is_consumed == False)

    statement = statement.offset(offset).limit(items_per_batch)
    items = session.exec(statement).all()
    return items


@router.get("/search/", response_model=List[Tuple[ItemPublic, float]])
async def hybrid_search(
    q: str,
    source_type: Optional[str] = None,
    include_consumed: bool = False,
    session: SQLSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    query_vector = await get_embedding(q)
    distance_expr = Item.embedding.cosine_distance(query_vector)

    statement = (
        select(Item, distance_expr)
        .where(Item.status == 'completed')
        .where(Item.user_id == current_user.id)
    )

    if not include_consumed:
        statement = statement.where(Item.is_consumed == False)

    if source_type:
        statement = statement.where(Item.source_type == source_type)

    statement = statement.order_by(distance_expr).limit(10)
    results = session.exec(statement).all()

    return [(item, round(1 - dist, 4)) for item, dist in results]


@router.delete("/{item_id}", status_code=204)
async def delete_item(
    item_id: int,
    session: SQLSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Cant find item with given ID.")

    # Check ownership
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item.")

    session.delete(item)
    session.commit()


@router.patch("/{item_id}/consume", response_model=ItemPublic)
async def toggle_consume_status(
        item_id: int,
        session: SQLSession = Depends(get_session),
        is_consumed: Optional[bool] = True,
        current_user: User = Depends(get_current_active_user)
):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Nie znaleziono elementu o podanym ID.")
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Nie masz uprawnień do edycji tego elementu.")

    if item.is_consumed!= is_consumed:
        item.is_consumed = not item.is_consumed

    if item.is_consumed:
        item.consumed_at = datetime.now()
    else:
        item.consumed_at = None

    session.add(item)
    session.commit()
    session.refresh(item)

    return item


@router.patch("/{item_id}", response_model=ItemPublic)
async def update_item(
        item_id: int,
        item_update: ItemUpdate,
        session: SQLSession = Depends(get_session),
        current_user: User = Depends(get_current_active_user)
):
    db_item = session.get(Item, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Nie znaleziono elementu.")

    if db_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Brak uprawnień do edycji tego elementu.")

    update_data = item_update.model_dump(exclude_unset=True)

    if "is_consumed" in update_data:
        if update_data["is_consumed"]:
            db_item.consumed_at = datetime.now()
        else:
            db_item.consumed_at = None

    for key, value in update_data.items():
        setattr(db_item, key, value)

    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item