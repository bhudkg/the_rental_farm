import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── User ──

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserMeOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str | None = None
    has_owner_profile: bool = False
    has_addresses: bool = False
    default_address_id: uuid.UUID | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PhoneUpdate(BaseModel):
    phone: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str


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
    distance_km: float | None = None
    wishlist_count: int = 0
    is_wishlisted: bool = False
    trending_score: float = 0.0
    owner_avg_rating: float | None = None
    owner_rating_count: int = 0

    model_config = {"from_attributes": True}


class OwnerInfo(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime
    avg_rating: float | None = None
    rating_count: int = 0

    model_config = {"from_attributes": True}


class TreeDetailOut(TreeOut):
    owner: OwnerInfo | None = None


# ── Order ──

class OrderCreate(BaseModel):
    tree_id: uuid.UUID
    address_id: uuid.UUID


class BatchOrderItem(BaseModel):
    tree_id: uuid.UUID


class BatchOrderCreate(BaseModel):
    items: list[BatchOrderItem]
    address_id: uuid.UUID


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
    delivery_full_name: str | None = None
    delivery_phone: str | None = None
    delivery_address_line_1: str | None = None
    delivery_address_line_2: str | None = None
    delivery_city: str | None = None
    delivery_state: str | None = None
    delivery_pincode: str | None = None
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


# ── Ratings ──

class OwnerRatingCreate(BaseModel):
    order_id: uuid.UUID
    rating: int = Field(..., ge=1, le=5)
    review: str | None = None


class OwnerRatingOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    owner_id: uuid.UUID
    order_id: uuid.UUID
    rating: int
    review: str | None = None
    created_at: datetime
    user_name: str | None = None

    model_config = {"from_attributes": True}


class CanRateOut(BaseModel):
    can_rate: bool
    owner_id: uuid.UUID | None = None
    owner_name: str | None = None
    already_rated: bool = False


# ── Addresses ──

class AddressCreate(BaseModel):
    label: str = "Home"
    full_name: str
    phone: str
    address_line_1: str
    address_line_2: str | None = None
    city: str
    state: str
    pincode: str
    is_default: bool = False


class AddressUpdate(BaseModel):
    label: str | None = None
    full_name: str | None = None
    phone: str | None = None
    address_line_1: str | None = None
    address_line_2: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    is_default: bool | None = None


class AddressOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    label: str
    full_name: str
    phone: str
    address_line_1: str
    address_line_2: str | None = None
    city: str
    state: str
    pincode: str
    is_default: bool
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── Owner Profile ──

class OwnerProfileCreate(BaseModel):
    farm_address: str
    farm_city: str
    farm_state: str
    farm_pincode: str
    id_proof_type: str
    id_proof_number: str
    bank_account_name: str | None = None
    bank_account_number: str | None = None
    bank_ifsc: str | None = None
    upi_id: str | None = None


class OwnerProfileUpdate(BaseModel):
    farm_address: str | None = None
    farm_city: str | None = None
    farm_state: str | None = None
    farm_pincode: str | None = None
    id_proof_type: str | None = None
    id_proof_number: str | None = None
    bank_account_name: str | None = None
    bank_account_number: str | None = None
    bank_ifsc: str | None = None
    upi_id: str | None = None


class OwnerProfileOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    farm_address: str
    farm_city: str
    farm_state: str
    farm_pincode: str
    id_proof_type: str
    id_proof_number: str
    bank_account_name: str | None = None
    bank_account_number: str | None = None
    bank_ifsc: str | None = None
    upi_id: str | None = None
    is_verified: bool
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
