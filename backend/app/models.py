from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List
from pgvector.sqlalchemy import Vector
from sqlmodel import SQLModel, Field, Column, JSON, Relationship

def format_datetime(dt: datetime) -> str:
    print(dt)
    return dt.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
class SourceType(str, Enum):
    youtube = "youtube"
    article = "article"
    reddit = "reddit"
    rss = "rss"
    other = "other"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now)

    items: List["Item"] = Relationship(back_populates="user")

class ItemTagLink(SQLModel, table=True):
    item_id: Optional[int] = Field(
        default=None, foreign_key="item.id", primary_key=True,ondelete="CASCADE"
    )
    tag_id: Optional[int] = Field(
        default=None, foreign_key="tag.id", primary_key=True,ondelete="CASCADE"
    )
class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True,index=True)

    items: List["Item"] = Relationship(back_populates="tags", link_model=ItemTagLink)
class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(unique=True,index=True)
    title: str
    source_type: str # youtube, article, reddit,rss, other
    created_at: datetime = Field(default_factory=lambda: format_datetime(datetime.now(timezone.utc)))
    creator: str
    status:str =  Field(default='pending')

    # User relationship
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="items")

    #consumed section
    is_consumed: bool = Field(default=False)
    consumed_at: Optional[datetime] = Field(default=None)

    #AI content fields
    summary: Optional[str] = None
    priority: int = Field(default=1,ge=1,le=10) # 1-10

    #metadata
    item_metadata: dict = Field(default_factory=dict,sa_column=Column(JSON))
    image_url: Optional[str] = None

    #vector embeddings
    embedding: Optional[list[float]] = Field(default=None,sa_column=Column(Vector(768)))

    tags: List[Tag] = Relationship(back_populates="items", link_model=ItemTagLink,sa_relationship_kwargs={"cascade":"all, delete"})

