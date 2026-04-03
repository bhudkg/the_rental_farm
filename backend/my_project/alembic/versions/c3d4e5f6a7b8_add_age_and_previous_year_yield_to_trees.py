"""add_age_and_previous_year_yield_to_trees

Revision ID: c3d4e5f6a7b8
Revises: 590bbb52dba4
Create Date: 2026-04-03 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = '590bbb52dba4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('trees', sa.Column('age', sa.Integer(), nullable=True))
    op.add_column('trees', sa.Column('previous_year_yield', sa.Float(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('trees', 'previous_year_yield')
    op.drop_column('trees', 'age')
