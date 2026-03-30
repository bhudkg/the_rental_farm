"""add_season_and_tree_detail_columns

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _tree_columns() -> set[str]:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    return {c["name"] for c in insp.get_columns("trees")}


def upgrade() -> None:
    existing = _tree_columns()

    if "season_start" not in existing:
        op.add_column("trees", sa.Column("season_start", sa.Integer(), nullable=True))
    if "season_end" not in existing:
        op.add_column("trees", sa.Column("season_end", sa.Integer(), nullable=True))
    if "maintenance_required" not in existing:
        op.add_column(
            "trees",
            sa.Column(
                "maintenance_required",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("false"),
            ),
        )
        op.alter_column("trees", "maintenance_required", server_default=None)
    if "image_url" not in existing:
        op.add_column("trees", sa.Column("image_url", sa.String(500), nullable=True))


def downgrade() -> None:
    existing = _tree_columns()
    for col in ("image_url", "maintenance_required", "season_end", "season_start"):
        if col in existing:
            op.drop_column("trees", col)
