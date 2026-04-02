"""merging two heads

Revision ID: 590bbb52dba4
Revises: 0aafdf00f8cc, 7e8f9a0b1c2d
Create Date: 2026-04-01 22:06:40.892320

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '590bbb52dba4'
down_revision: Union[str, Sequence[str], None] = ('0aafdf00f8cc', '7e8f9a0b1c2d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
