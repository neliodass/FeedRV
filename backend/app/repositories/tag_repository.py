from typing import List
from sqlmodel import Session, select
from app.models import Tag


class TagRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_all(self) -> List[Tag]:
        return self.session.exec(select(Tag)).all()

