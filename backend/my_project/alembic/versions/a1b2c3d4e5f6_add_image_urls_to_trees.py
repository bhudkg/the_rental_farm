"""add_image_urls_to_trees

Revision ID: a1b2c3d4e5f6
Revises: 9b477a656f63
Create Date: 2026-03-27 23:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '9b477a656f63'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('trees', sa.Column('image_urls', ARRAY(sa.String(500)), nullable=True))


def downgrade() -> None:
    op.drop_column('trees', 'image_urls')
