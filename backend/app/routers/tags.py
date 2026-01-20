from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session as SQLSession

from app.auth import get_current_active_user
from app.database import get_session
from app.models import User
from app.dto import TagPublic
from app.services.tag_service import TagService

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("/", response_model=List[TagPublic])
async def read_tags(
    session: SQLSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    tag_service = TagService(session)
    tags = tag_service.get_all_tags()
    return tags

