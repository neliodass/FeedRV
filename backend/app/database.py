import os
from sqlmodel import create_engine,Session,text,SQLModel
DATABASE_URL = os.getenv("DATABASE_URL","postgresql://postgres:devpassword@db:5432/feedrv")
from app.models import Item, Tag, ItemTagLink
engine = create_engine(DATABASE_URL)
def init_db():
    with Session(engine) as session:
        session.exec(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        session.commit()
    SQLModel.metadata.create_all(engine)
def get_session():
    with Session(engine) as session:
        yield session