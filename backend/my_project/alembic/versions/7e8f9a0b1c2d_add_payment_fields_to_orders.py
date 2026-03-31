"""add_payment_fields_to_orders

Revision ID: 7e8f9a0b1c2d
Revises: 5df00cbf609c
Create Date: 2026-03-30 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7e8f9a0b1c2d'
down_revision: Union[str, Sequence[str], None] = '5df00cbf609c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add payment-related fields to orders table."""
    op.add_column('orders', sa.Column('payment_id', sa.String(100), nullable=True))
    op.add_column('orders', sa.Column('payment_gateway', sa.String(20), nullable=True))
    op.add_column('orders', sa.Column('payment_status', sa.String(20), nullable=False, server_default='pending'))
    op.add_column('orders', sa.Column('payment_method', sa.String(30), nullable=True))
    op.add_column('orders', sa.Column('payment_captured_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('orders', sa.Column('refund_id', sa.String(100), nullable=True))
    op.add_column('orders', sa.Column('refunded_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Remove payment-related fields from orders table."""
    op.drop_column('orders', 'refunded_at')
    op.drop_column('orders', 'refund_id')
    op.drop_column('orders', 'payment_captured_at')
    op.drop_column('orders', 'payment_method')
    op.drop_column('orders', 'payment_status')
    op.drop_column('orders', 'payment_gateway')
    op.drop_column('orders', 'payment_id')
