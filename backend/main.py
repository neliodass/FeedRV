from fastapi import FastAPI, Depends
from sqlmodel import Session, select
from database import create_db_and_tables, get_session
from models import Link

app = FastAPI()
@app.on_event("startup") 
def on_startup():
    create_db_and_tables()
@app.get("/") 
def read_root():
    return {"status": "Online", "project": "FeedRV"}
@app.post("/links/") 
def create_link(link: Link, session: Session = Depends(get_session)):
    session.add(link) 
    session.commit() 
    session.refresh(link) 
    return link