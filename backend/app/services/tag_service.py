from typing import List
from sqlmodel import Session

from app.repositories.tag_repository import TagRepository
from app.models import Tag


class TagService:
    def __init__(self, session: Session):
        self.repository = TagRepository(session)

    def get_all_tags(self) -> List[Tag]:
        return self.repository.get_all()

