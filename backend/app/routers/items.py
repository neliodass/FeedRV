from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query

from sqlmodel import select, Session as SQLSession, desc, asc

from app.auth import get_current_active_user
from app.database import get_session, engine
from app.models import Item, Tag, ItemPublic, User, ItemUpdate, SourceType
from app.services import  get_embedding
from datetime import datetime
from app.tasks.background_tasks import process_item_with_retry
router = APIRouter(prefix="/items", tags=["items"])


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

    background_tasks.add_task(process_item_with_retry, new_item.id, url, max_retries=3, initial_delay=2.0)
    return new_item


@router.get("/", response_model=List[ItemPublic])
async def read_items(
        items_per_batch: int = 10,
        page: int = 1,
        include_consumed: bool = False,
        sort_order: str | None = Query(
            default="created_at:desc",
            alias="sort",
            description="Format: field_name:direction (e.g., created_at:asc or created_at:desc)\n Allowed: created_at, priority, title"
        ),
        session: SQLSession = Depends(get_session),
        current_user: User = Depends(get_current_active_user)
):
    offset = max(0, (page - 1) * items_per_batch)
    statement = select(Item).where(Item.user_id == current_user.id)

    if not include_consumed:
        statement = statement.where(Item.is_consumed == False)
    if sort_order:
        try:
            field_name, direction = sort_order.split(":")
        except ValueError:
            raise HTTPException(400, "Invalid sort format. Use 'field:direction'")

        allowed_sort_fields = {
            "created_at": Item.created_at,
            "priority": Item.priority,
            "title": Item.title,
        }

        if field_name not in allowed_sort_fields:
            raise HTTPException(400, f"Sorting by '{field_name}' is not allowed")

        column = allowed_sort_fields[field_name]

        if direction.lower() == "desc":
            statement = statement.order_by(desc(column))
        else:
            statement = statement.order_by(asc(column))

    statement = statement.offset(offset).limit(items_per_batch)
    items = session.exec(statement).all()
    return items


@router.get("/{item_id}", response_model=ItemPublic)
async def read_item(
        item_id: int,
        session: SQLSession = Depends(get_session),
        current_user: User = Depends(get_current_active_user)
):
    statement = select(Item).where(Item.id == item_id, Item.user_id == current_user.id)
    item = session.exec(statement).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
    return item


@router.get("/search/", response_model=List[ItemPublic])
async def hybrid_search(
        q: Optional[str] = None,
        source_type: SourceType|None = None,
        items_per_batch: int = 10,
        page: int = 1,
        include_consumed: bool = False,
        session: SQLSession = Depends(get_session),
        current_user: User = Depends(get_current_active_user)
):
    offset = (page - 1) * items_per_batch
    base_query = (
        select(Item)
        .where(Item.status == 'completed')
        .where(Item.user_id == current_user.id)

    )
    if not include_consumed:
        base_query = base_query.where(Item.is_consumed == False)

    if source_type:
        base_query = base_query.where(Item.source_type == source_type)

    if q and len(q.strip()) > 0:
        query_vector = await get_embedding(q)
        distance_expr = Item.embedding.cosine_distance(query_vector)
        vector_query = base_query.add_columns(distance_expr)
        check_best = vector_query.order_by(distance_expr).limit(1)
        best_match = session.execute(check_best).first()

        if not best_match:
            return []

        min_dist = best_match[1]
        dynamic_threshold = max(min_dist * 1.25, min_dist + 0.05)
        statement = (
            vector_query
            .where(distance_expr <= dynamic_threshold)
            .order_by(distance_expr)
            .offset(offset)
            .limit(items_per_batch)
        )

        results = session.exec(statement).all()
        return [item for item in results]

    else:
        statement = (
            base_query
            .order_by(Item.created_at.desc())
            .offset(offset)
            .limit(items_per_batch)
        )

        results = session.exec(statement).all()
        return [item for item in results]


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

    if item.is_consumed != is_consumed:
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
