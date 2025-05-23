"""Add more attributes to Uploader

Revision ID: d334636e9673
Revises: c43f59a05bd2
Create Date: 2025-03-31 14:44:25.432386

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd334636e9673'
down_revision: Union[str, None] = 'c43f59a05bd2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('uploaders', sa.Column('url', sa.String(), nullable=True))
    op.add_column('uploaders', sa.Column('channel_id', sa.String(), nullable=False))
    op.alter_column('uploaders', 'source_id',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.create_unique_constraint(None, 'uploaders', ['channel_id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'uploaders', type_='unique')
    op.alter_column('uploaders', 'source_id',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.drop_column('uploaders', 'channel_id')
    op.drop_column('uploaders', 'url')
    # ### end Alembic commands ###
