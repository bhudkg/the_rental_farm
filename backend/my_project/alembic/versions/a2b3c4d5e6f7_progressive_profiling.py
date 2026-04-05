"""progressive_profiling

Revision ID: a2b3c4d5e6f7
Revises: d1e2f3a4b5c6
Create Date: 2026-04-05 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = "a2b3c4d5e6f7"
down_revision: Union[str, Sequence[str], None] = "d1e2f3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _col_exists(table: str, column: str) -> bool:
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT 1 FROM information_schema.columns "
        "WHERE table_name = :t AND column_name = :c"
    ), {"t": table, "c": column})
    return result.scalar() is not None


def _table_exists(table: str) -> bool:
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT 1 FROM information_schema.tables "
        "WHERE table_name = :t AND table_schema = 'public'"
    ), {"t": table})
    return result.scalar() is not None


def upgrade() -> None:
    if not _col_exists("users", "phone"):
        op.add_column("users", sa.Column("phone", sa.String(20), nullable=True))

    if not _table_exists("user_addresses"):
        op.create_table(
            "user_addresses",
            sa.Column("id", UUID(as_uuid=True), primary_key=True),
            sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, index=True),
            sa.Column("label", sa.String(50), nullable=False, server_default="Home"),
            sa.Column("full_name", sa.String(200), nullable=False),
            sa.Column("phone", sa.String(20), nullable=False),
            sa.Column("address_line_1", sa.String(500), nullable=False),
            sa.Column("address_line_2", sa.String(500), nullable=True),
            sa.Column("city", sa.String(100), nullable=False),
            sa.Column("state", sa.String(100), nullable=False),
            sa.Column("pincode", sa.String(10), nullable=False),
            sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _table_exists("owner_profiles"):
        op.create_table(
            "owner_profiles",
            sa.Column("id", UUID(as_uuid=True), primary_key=True),
            sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), unique=True, nullable=False),
            sa.Column("farm_address", sa.String(500), nullable=False),
            sa.Column("farm_city", sa.String(100), nullable=False),
            sa.Column("farm_state", sa.String(100), nullable=False),
            sa.Column("farm_pincode", sa.String(10), nullable=False),
            sa.Column("id_proof_type", sa.String(20), nullable=False),
            sa.Column("id_proof_number", sa.String(50), nullable=False),
            sa.Column("bank_account_name", sa.String(200), nullable=True),
            sa.Column("bank_account_number", sa.String(30), nullable=True),
            sa.Column("bank_ifsc", sa.String(20), nullable=True),
            sa.Column("upi_id", sa.String(100), nullable=True),
            sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )

    for col_name, col_type in [
        ("delivery_full_name", sa.String(200)),
        ("delivery_phone", sa.String(20)),
        ("delivery_address_line_1", sa.String(500)),
        ("delivery_address_line_2", sa.String(500)),
        ("delivery_city", sa.String(100)),
        ("delivery_state", sa.String(100)),
        ("delivery_pincode", sa.String(10)),
    ]:
        if not _col_exists("orders", col_name):
            op.add_column("orders", sa.Column(col_name, col_type, nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "delivery_pincode")
    op.drop_column("orders", "delivery_state")
    op.drop_column("orders", "delivery_city")
    op.drop_column("orders", "delivery_address_line_2")
    op.drop_column("orders", "delivery_address_line_1")
    op.drop_column("orders", "delivery_phone")
    op.drop_column("orders", "delivery_full_name")
    op.drop_table("owner_profiles")
    op.drop_table("user_addresses")
    op.drop_column("users", "phone")
