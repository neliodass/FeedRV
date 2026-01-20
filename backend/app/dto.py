from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, field_serializer
from sqlmodel import SQLModel


class TagBasic(SQLModel):
    id: int
    name: str


class ItemPublic(SQLModel):
    id: int
    url: str
    title: str
    source_type: str
    created_at: datetime
    creator: str
    summary: Optional[str]
    priority: int
    status: str
    tags: List[TagBasic]
    item_metadata: dict
    image_url: Optional[str]
    is_consumed: bool

    @field_serializer('created_at')
    def serialize_dt(self, dt: datetime, _info):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt.strftime('%Y-%m-%dT%H:%M:%SZ')


class ItemUpdate(SQLModel):
    title: Optional[str] = None
    priority: Optional[int] = None
    is_consumed: Optional[bool] = None
    user_note: Optional[str] = None


class TagPublic(SQLModel):
    id: int
    name: str
    itemsCount: int


class UserCreate(SQLModel):
    email: str
    password: str
    password_confirm: str


class UserPublic(SQLModel):
    id: int
    email: str
    is_active: bool
    created_at: datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenData(SQLModel):
    email: Optional[str] = None

