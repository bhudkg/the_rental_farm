import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="renter")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    listed_trees: Mapped[list["Tree"]] = relationship(back_populates="owner")


class Tree(Base):
    __tablename__ = "trees"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    variety: Mapped[str | None] = mapped_column(String(150), nullable=True)
    speciality: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str] = mapped_column(String(2000), nullable=True)

    # Location
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Pricing
    price_per_day: Mapped[float] = mapped_column(Float, nullable=False)
    price_per_month: Mapped[float] = mapped_column(Float, nullable=False)
    price_per_season: Mapped[float | None] = mapped_column(Float, nullable=True)
    deposit: Mapped[float] = mapped_column(Float, nullable=False, default=0)

    # Details
    size: Mapped[str] = mapped_column(String(50), nullable=True)
    min_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    available_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    maintenance_required: Mapped[bool] = mapped_column(Boolean, default=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner: Mapped["User | None"] = relationship(back_populates="listed_trees")
    orders: Mapped[list["Order"]] = relationship(back_populates="tree")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    tree_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trees.id"), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    deposit: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    delivery_slot: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="orders")
    tree: Mapped["Tree"] = relationship(back_populates="orders")
