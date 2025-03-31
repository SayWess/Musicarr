"""Change uploader url to channel_url

Revision ID: c43f59a05bd2
Revises: 3683731fbdfe
Create Date: 2025-03-30 22:22:56.171870

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c43f59a05bd2'
down_revision: Union[str, None] = '3683731fbdfe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('playlists', 'folder',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.add_column('uploaders', sa.Column('channel_url', sa.String(), nullable=False))
    op.drop_column('uploaders', 'url')
    op.alter_column('videos', 'folder',
               existing_type=sa.VARCHAR(),
               nullable=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('videos', 'folder',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.add_column('uploaders', sa.Column('url', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.drop_column('uploaders', 'channel_url')
    op.alter_column('playlists', 'folder',
               existing_type=sa.VARCHAR(),
               nullable=False)
    # ### end Alembic commands ###
