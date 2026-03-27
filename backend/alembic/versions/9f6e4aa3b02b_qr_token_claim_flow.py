"""qr token claim flow

Revision ID: 9f6e4aa3b02b
Revises: d4b4ce50a6e6
Create Date: 2026-03-28 00:00:01.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9f6e4aa3b02b"
down_revision = "d4b4ce50a6e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("qr_tokens", sa.Column("role", sa.String(length=50), nullable=True))
    op.execute("UPDATE qr_tokens SET role = 'member' WHERE role IS NULL")
    op.alter_column("qr_tokens", "role", nullable=False, server_default="member")
    op.alter_column("qr_tokens", "user_id", existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    op.alter_column("qr_tokens", "user_id", existing_type=sa.Integer(), nullable=False)
    op.drop_column("qr_tokens", "role")
