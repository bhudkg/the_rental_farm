from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.responses import RedirectResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine, get_db
from routes import auth, images, orders, owner, trees
from seed import seed_trees

import models  # noqa: F401 — ensures models are registered with Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_trees(db)
    finally:
        db.close()
    yield


app = FastAPI(title="The Rental Farm", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(trees.router)
app.include_router(orders.router)
app.include_router(owner.router)
app.include_router(images.router)


@app.get("/")
async def home():
    # Browsers often hit "/" first; redirect to docs instead of returning 404.
    return RedirectResponse(url="/docs")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    # Return empty favicon response to avoid noisy 404 logs.
    return Response(status_code=204)


@app.get("/api")
async def root():
    return {"message": "Hello World from The Rental Farm"}


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "healthy", "database": "connected"}
