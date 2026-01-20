from typing import Optional, List
from sqlmodel import Session, select, desc, asc
from app.models import Item, SourceType


class ItemRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, item_id: int) -> Optional[Item]:
        return self.session.get(Item, item_id)

    def get_by_id_and_user(self, item_id: int, user_id: int) -> Optional[Item]:
        statement = select(Item).where(Item.id == item_id, Item.user_id == user_id)
        return self.session.exec(statement).first()

    def get_by_url(self, url: str) -> Optional[Item]:
        return self.session.exec(select(Item).where(Item.url == url)).first()

    def get_all_by_user(
        self,
        user_id: int,
        offset: int = 0,
        limit: int = 10,
        include_consumed: bool = False,
        sort_field: Optional[str] = None,
        sort_direction: str = "desc"
    ) -> List[Item]:
        statement = select(Item).where(Item.user_id == user_id)

        if not include_consumed:
            statement = statement.where(Item.is_consumed == False)

        if sort_field:
            column = getattr(Item, sort_field)
            if sort_direction.lower() == "desc":
                statement = statement.order_by(desc(column))
            else:
                statement = statement.order_by(asc(column))

        statement = statement.offset(offset).limit(limit)
        return self.session.exec(statement).all()

    def search(
        self,
        user_id: int,
        include_consumed: bool = False,
        source_type: Optional[SourceType] = None
    ):
        base_query = (
            select(Item)
            .where(Item.status == 'completed')
            .where(Item.user_id == user_id)
        )

        if not include_consumed:
            base_query = base_query.where(Item.is_consumed == False)

        if source_type:
            base_query = base_query.where(Item.source_type == source_type)

        return base_query

    def vector_search(self, base_query, query_vector: List[float], offset: int, limit: int) -> List[Item]:
        distance_expr = Item.embedding.cosine_distance(query_vector)
        vector_query = base_query.add_columns(distance_expr)

        check_best = vector_query.order_by(distance_expr).limit(1)
        best_match = self.session.execute(check_best).first()

        if not best_match:
            return []

        min_dist = best_match[1]
        dynamic_threshold = max(min_dist * 1.25, min_dist + 0.05)

        statement = (
            vector_query
            .where(distance_expr <= dynamic_threshold)
            .order_by(distance_expr)
            .offset(offset)
            .limit(limit)
        )

        results = self.session.exec(statement).all()
        return [item for item in results]

    def list_items(self, base_query, offset: int, limit: int) -> List[Item]:
        statement = (
            base_query
            .order_by(Item.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return self.session.exec(statement).all()

    def create(self, item: Item) -> Item:
        self.session.add(item)
        self.session.commit()
        self.session.refresh(item)
        return item

    def update(self, item: Item) -> Item:
        self.session.add(item)
        self.session.commit()
        self.session.refresh(item)
        return item

    def delete(self, item: Item) -> None:
        self.session.delete(item)
        self.session.commit()

