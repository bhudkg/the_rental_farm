from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from auth_utils import create_access_token, hash_password, require_user, verify_password
from database import get_db
from models import User
from schemas import LoginRequest, Token, UserCreate, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(body: UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_user(db, {
        "name": body.name,
        "email": body.email,
        "password_hash": hash_password(body.password),
    })
    return {
        "access_token": create_access_token(user.id),
        "user": user,
    }


@router.post("/login", response_model=Token)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": create_access_token(user.id),
        "user": user,
    }


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(require_user)):
    return current_user
