import uuid
from datetime import datetime

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
    size: str | None = None
    min_quantity: int = 1
    season_start: int | None = None
    season_end: int | None = None
    age: int | None = None
    previous_year_yield: float | None = None
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
    size: str | None = None
    min_quantity: int | None = None
    season_start: int | None = None
    season_end: int | None = None
    age: int | None = None
    previous_year_yield: float | None = None
    image_url: str | None = None
    image_urls: list[str] | None = None


class TreeOut(TreeBase):
    id: uuid.UUID
    owner_id: uuid.UUID | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class OwnerInfo(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TreeDetailOut(TreeOut):
    owner: OwnerInfo | None = None


# ── Order ──

class OrderCreate(BaseModel):
    tree_id: uuid.UUID


class BatchOrderItem(BaseModel):
    tree_id: uuid.UUID


class BatchOrderCreate(BaseModel):
    items: list[BatchOrderItem]


class BatchPaymentVerifyRequest(BaseModel):
    order_ids: list[uuid.UUID]
    payment_id: str
    order_id: str
    signature: str


class OrderOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    tree_id: uuid.UUID
    total_price: float
    status: str
    created_at: datetime
    tree: TreeOut | None = None
    payment_id: str | None = None
    payment_gateway: str | None = None
    payment_status: str = "pending"
    payment_method: str | None = None
    payment_captured_at: datetime | None = None
    refund_id: str | None = None
    refunded_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── Payment ──

class PaymentDetailsOut(BaseModel):
    gateway: str
    order_id: str | None = None
    amount: float
    currency: str
    key: str | None = None
    client_secret: str | None = None
    payment_intent_id: str | None = None


class PaymentVerifyRequest(BaseModel):
    payment_id: str
    order_id: str
    signature: str


class PaymentStatusOut(BaseModel):
    payment_status: str
    order_status: str
