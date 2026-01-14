from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import init_db
from app.routers import auth, items, tags, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="FeedRV API", lifespan=lifespan)

# Register routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(items.router)
app.include_router(tags.router)
