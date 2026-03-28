import uuid
from datetime import date, datetime

from pydantic import BaseModel, EmailStr, field_validator


# ── User ──

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Tree ──

class TreeBase(BaseModel):
    name: str
    type: str
    variety: str | None = None
    description: str | None = None
    location: str | None = None
    city: str | None = None
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    price_per_season: float | None = None
    deposit: float = 0
    size: str | None = None
    min_quantity: int = 1
    available_quantity: int = 1
    season_start: int | None = None
    season_end: int | None = None
    maintenance_required: bool = False
    image_url: str | None = None
    image_urls: list[str] = []

    @field_validator("image_urls", mode="before")
    @classmethod
    def coerce_image_urls(cls, v):
        return v if v is not None else []


class TreeCreate(TreeBase):
    pass


class TreeUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    variety: str | None = None
    description: str | None = None
    location: str | None = None
    city: str | None = None
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    price_per_season: float | None = None
    deposit: float | None = None
    size: str | None = None
    min_quantity: int | None = None
    available_quantity: int | None = None
    season_start: int | None = None
    season_end: int | None = None
    maintenance_required: bool | None = None
    image_url: str | None = None
    image_urls: list[str] | None = None


class TreeOut(TreeBase):
    id: uuid.UUID
    owner_id: uuid.UUID | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Availability ──

class AvailabilityRequest(BaseModel):
    start_date: date
    end_date: date


class AvailabilityResponse(BaseModel):
    available: bool
    available_quantity: int
    booked_quantity: int


# ── Order ──

class OrderCreate(BaseModel):
    tree_id: uuid.UUID
    start_date: date
    end_date: date
    delivery_slot: datetime | None = None


class OrderOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    tree_id: uuid.UUID
    start_date: date
    end_date: date
    total_price: float
    deposit: float
    delivery_slot: datetime | None
    status: str
    created_at: datetime
    tree: TreeOut | None = None

    model_config = {"from_attributes": True}
