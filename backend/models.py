from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class Link(SQLModel, table=True):
     id: Optional[int] = Field(default=None, primary_key=True) 
     url: str 
     title: Optional[str] = None 
     description: Optional[str] = None 
     category: Optional[str] = "Uncategorized" 
     created_at: datetime = Field(default_factory=datetime.utcnow)