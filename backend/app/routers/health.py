from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/")
def read_root():
    return {"message": "Hello from FeedRV Backend!"}


@router.get("/health")
def health_check():
    return {"status": "ok"}

