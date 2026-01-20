from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException
from sqlmodel import Session

from app.repositories.item_repository import ItemRepository
from app.models import Item, SourceType
from app.dto import ItemUpdate


class ItemService:
    def __init__(self, session: Session):
        self.repository = ItemRepository(session)

    def create_item(self, url: str, user_id: int) -> Item:
        existing_item = self.repository.get_by_url(url)
        if existing_item:
            raise HTTPException(status_code=400, detail="Ten link został już zapisany.")

        new_item = Item(
            url=url,
            title="Analyzing...",
            summary="AI analysis in progress...",
            source_type="pending",
            creator="pending",
            priority=1,
            user_id=user_id
        )
        return self.repository.create(new_item)

    def get_items(
        self,
        user_id: int,
        items_per_batch: int = 10,
        page: int = 1,
        include_consumed: bool = False,
        sort_order: Optional[str] = "created_at:desc"
    ) -> List[Item]:
        offset = max(0, (page - 1) * items_per_batch)

        if sort_order:
            try:
                field_name, direction = sort_order.split(":")
            except ValueError:
                raise HTTPException(400, "Invalid sort format. Use 'field:direction'")

            allowed_sort_fields = ["created_at", "priority", "title"]

            if field_name not in allowed_sort_fields:
                raise HTTPException(400, f"Sorting by '{field_name}' is not allowed")

            return self.repository.get_all_by_user(
                user_id=user_id,
                offset=offset,
                limit=items_per_batch,
                include_consumed=include_consumed,
                sort_field=field_name,
                sort_direction=direction
            )

        return self.repository.get_all_by_user(
            user_id=user_id,
            offset=offset,
            limit=items_per_batch,
            include_consumed=include_consumed
        )

    def get_item(self, item_id: int, user_id: int) -> Item:
        item = self.repository.get_by_id_and_user(item_id, user_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found.")
        return item

    def search_items(
        self,
        user_id: int,
        query: Optional[str] = None,
        source_type: Optional[SourceType] = None,
        items_per_batch: int = 10,
        page: int = 1,
        include_consumed: bool = False,
        query_vector: Optional[List[float]] = None
    ) -> List[Item]:
        offset = (page - 1) * items_per_batch
        base_query = self.repository.search(
            user_id=user_id,
            include_consumed=include_consumed,
            source_type=source_type
        )

        if query and len(query.strip()) > 0 and query_vector:
            return self.repository.vector_search(base_query, query_vector, offset, items_per_batch)
        else:
            return self.repository.list_items(base_query, offset, items_per_batch)

    def delete_item(self, item_id: int, user_id: int) -> None:
        item = self.repository.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Cant find item with given ID.")

        if item.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this item.")

        self.repository.delete(item)

    def toggle_consume_status(self, item_id: int, user_id: int, is_consumed: bool = True) -> Item:
        item = self.repository.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Nie znaleziono elementu o podanym ID.")

        if item.user_id != user_id:
            raise HTTPException(status_code=403, detail="Nie masz uprawnień do edycji tego elementu.")

        if item.is_consumed != is_consumed:
            item.is_consumed = not item.is_consumed

        if item.is_consumed:
            item.consumed_at = datetime.now()
        else:
            item.consumed_at = None

        return self.repository.update(item)

    def update_item(self, item_id: int, user_id: int, item_update: ItemUpdate) -> Item:
        db_item = self.repository.get_by_id(item_id)
        if not db_item:
            raise HTTPException(status_code=404, detail="Nie znaleziono elementu.")

        if db_item.user_id != user_id:
            raise HTTPException(status_code=403, detail="Brak uprawnień do edycji tego elementu.")

        update_data = item_update.model_dump(exclude_unset=True)

        if "is_consumed" in update_data:
            if update_data["is_consumed"]:
                db_item.consumed_at = datetime.now()
            else:
                db_item.consumed_at = None

        for key, value in update_data.items():
            setattr(db_item, key, value)

        return self.repository.update(db_item)

