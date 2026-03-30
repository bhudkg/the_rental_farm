"""merge heads

Revision ID: 0aafdf00f8cc
Revises: 6c4c47b37e26, b2c3d4e5f6a7
Create Date: 2026-03-30 14:40:15.166217

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0aafdf00f8cc'
down_revision: Union[str, Sequence[str], None] = ('6c4c47b37e26', 'b2c3d4e5f6a7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
