"""add_google_sso_fields_to_users

Revision ID: d1e2f3a4b5c6
Revises: b8d2b7420dc9
Create Date: 2026-04-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d1e2f3a4b5c6"
down_revision: Union[str, Sequence[str], None] = "b8d2b7420dc9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("users", "password_hash", existing_type=sa.String(255), nullable=True)
    op.add_column("users", sa.Column("auth_provider", sa.String(20), nullable=False, server_default="local"))


def downgrade() -> None:
    op.drop_column("users", "auth_provider")
    op.alter_column("users", "password_hash", existing_type=sa.String(255), nullable=False)
