from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query

from sqlmodel import Session as SQLSession

from app.auth import get_current_active_user
from app.database import get_session
from app.models import ItemPublic, User, ItemUpdate, SourceType
from app.services.item_service import ItemService
from app.services.embedding_service import get_embedding
from app.tasks.background_tasks import process_item_with_retry

router = APIRouter(prefix="/items", tags=["items"])


@router.post("/", response_model=ItemPublic)
async def create_item(
        url: str,
        background_tasks: BackgroundTasks,
        session: SQLSession = Depends(get_session),
        current_user: User = Depends(get_current_active_user)
):
    item_service = ItemService(session)
    new_item = item_service.create_item(url, current_user.id)
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
    item_service = ItemService(session)
    items = item_service.get_items(
        user_id=current_user.id,
        items_per_batch=items_per_batch,
        page=page,
        include_consumed=include_consumed,
        sort_order=sort_order
    )
    return items


@router.get("/{item_id}", response_model=ItemPublic)
async def read_item(
        item_id: int,
        session: SQLSession = Depends(get_session),
        current_user: User = Depends(get_current_active_user)
):
    item_service = ItemService(session)
    item = item_service.get_item(item_id, current_user.id)
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
    item_service = ItemService(session)
    query_vector = None

    if q and len(q.strip()) > 0:
        query_vector = await get_embedding(q)

    items = item_service.search_items(
        user_id=current_user.id,
        query=q,
        source_type=source_type,
        items_per_batch=items_per_batch,
        page=page,
        include_consumed=include_consumed,
        query_vector=query_vector
    )
    return items


@router.delete("/{item_id}", status_code=204)
async def delete_item(
        item_id: int,
        session: SQLSession = Depends(get_session),
        current_user: User = Depends(get_current_active_user)
):
    item_service = ItemService(session)
    item_service.delete_item(item_id, current_user.id)


@router.patch("/{item_id}/consume", response_model=ItemPublic)
async def toggle_consume_status(
        item_id: int,
        session: SQLSession = Depends(get_session),
        is_consumed: Optional[bool] = True,
        current_user: User = Depends(get_current_active_user)
):
    item_service = ItemService(session)
    item = item_service.toggle_consume_status(item_id, current_user.id, is_consumed)
    return item


@router.patch("/{item_id}", response_model=ItemPublic)
async def update_item(
        item_id: int,
        item_update: ItemUpdate,
        session: SQLSession = Depends(get_session),
        current_user: User = Depends(get_current_active_user)
):
    item_service = ItemService(session)
    db_item = item_service.update_item(item_id, current_user.id, item_update)
    return db_item
