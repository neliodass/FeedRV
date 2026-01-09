from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import select, Session as SQLSession

from app.auth import get_current_active_user
from app.database import get_session
from app.models import Tag, TagPublic, User

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("/", response_model=List[TagPublic])
async def read_tags(
    session: SQLSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    tags = session.exec(select(Tag)).all()
    return tags

