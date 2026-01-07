from datetime import datetime
from typing import Optional,List
from pgvector.sqlalchemy import Vector
from sqlmodel import SQLModel, Field,Column,JSON,Relationship

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
    created_at: datetime = Field(default_factory=datetime.now)
    creator: str

    #AI content fields
    summary: Optional[str] = None
    priority: int = Field(default=1,ge=1,le=10) # 1-10

    #metadata
    item_metadata: dict = Field(default_factory=dict,sa_column=Column(JSON))

    #vector embeddings
    embedding: Optional[list[float]] = Field(default=None,sa_column=Column(Vector(768)))

    tags: List[Tag] = Relationship(back_populates="items", link_model=ItemTagLink,sa_relationship_kwargs={"cascade":"all, delete"})
class ItemPublic(SQLModel):
    id: int
    url: str
    title: str
    source_type: str
    created_at: datetime
    creator: str
    summary: Optional[str]
    priority: int
    tags: List[Tag]
    item_metadata: dict
