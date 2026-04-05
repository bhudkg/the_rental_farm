import logging
import os

from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

import crud
from auth_utils import create_access_token, hash_password, require_user, verify_password
from database import get_db
from models import User
from schemas import GoogleLoginRequest, LoginRequest, Token, UserCreate, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(body: UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_user(db, {
        "name": body.name,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "auth_provider": "local",
    })
    return {
        "access_token": create_access_token(user.id),
        "user": user,
    }


@router.post("/login", response_model=Token)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, body.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.password_hash is None:
        raise HTTPException(
            status_code=400,
            detail="This account uses Google Sign-In. Please sign in with Google.",
        )
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": create_access_token(user.id),
        "user": user,
    }


@router.post("/google", response_model=Token)
def google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google SSO is not configured on the server")

    try:
        payload = google_id_token.verify_oauth2_token(
            body.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception as exc:
        logger.exception("Google token verification failed: %s", exc)
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {exc}")

    email = payload.get("email")
    name = payload.get("name", "")
    if not email:
        raise HTTPException(status_code=401, detail="Google token missing email")
    if not payload.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google email not verified")

    user = crud.get_user_by_email(db, email)
    if user:
        if user.auth_provider == "local":
            user.auth_provider = "both"
            db.commit()
            db.refresh(user)
    else:
        user = crud.create_user(db, {
            "name": name,
            "email": email,
            "password_hash": None,
            "auth_provider": "google",
        })

    return {
        "access_token": create_access_token(user.id),
        "user": user,
    }


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(require_user)):
    return current_user
