from fastapi import FastAPI

app = FastAPI(title="FeedRV API")

@app.get("/")
def read_root():
    return {"message": "Hello from FeedRV Backend!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}