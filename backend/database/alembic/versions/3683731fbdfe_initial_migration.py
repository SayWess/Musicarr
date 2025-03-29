"""Initial migration

Revision ID: 3683731fbdfe
Revises: 
Create Date: 2025-03-29 02:50:21.977238

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3683731fbdfe'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('uploaders',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('source_id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('url', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('source_id')
    )
    op.create_table('playlists',
    sa.Column('check_every_day', sa.Boolean(), nullable=True),
    sa.Column('last_published', sa.String(), nullable=True),
    sa.Column('default_format', sa.Enum('VIDEO', 'AUDIO', name='downloadformat'), nullable=True),
    sa.Column('default_quality', sa.String(), nullable=True),
    sa.Column('default_subtitles', sa.Boolean(), nullable=True),
    sa.Column('uploader_id', sa.UUID(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('source_id', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('thumbnail', sa.String(), nullable=True),
    sa.Column('upload_date', sa.String(), nullable=True),
    sa.Column('folder', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['uploader_id'], ['uploaders.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('source_id')
    )
    op.create_table('videos',
    sa.Column('duration', sa.String(), nullable=True),
    sa.Column('uploader_id', sa.UUID(), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('source_id', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('thumbnail', sa.String(), nullable=True),
    sa.Column('upload_date', sa.String(), nullable=True),
    sa.Column('folder', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['uploader_id'], ['uploaders.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('source_id')
    )
    op.create_table('playlist_videos',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('playlist_id', sa.UUID(), nullable=False),
    sa.Column('video_id', sa.UUID(), nullable=False),
    sa.Column('state', sa.Enum('IDLE', 'DOWNLOADING', 'DOWNLOADED', 'ERROR', name='downloadstate'), nullable=True),
    sa.Column('format', sa.Enum('VIDEO', 'AUDIO', name='downloadformat'), nullable=True),
    sa.Column('quality', sa.String(), nullable=True),
    sa.Column('subtitles', sa.Boolean(), nullable=True),
    sa.Column('custom_title', sa.String(), nullable=True),
    sa.Column('custom_folder', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['playlist_id'], ['playlists.id'], ),
    sa.ForeignKeyConstraint(['video_id'], ['videos.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('_prisma_migrations')
    op.drop_index('users_username_key', table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('username', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('password', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(precision=3), server_default=sa.text('CURRENT_TIMESTAMP'), autoincrement=False, nullable=False)
    )
    op.create_index('users_username_key', 'users', ['username'], unique=True)
    op.create_table('_prisma_migrations',
    sa.Column('id', sa.VARCHAR(length=36), autoincrement=False, nullable=False),
    sa.Column('checksum', sa.VARCHAR(length=64), autoincrement=False, nullable=False),
    sa.Column('finished_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.Column('migration_name', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
    sa.Column('logs', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('rolled_back_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.Column('started_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('applied_steps_count', sa.INTEGER(), server_default=sa.text('0'), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name='_prisma_migrations_pkey')
    )
    op.drop_table('playlist_videos')
    op.drop_table('videos')
    op.drop_table('playlists')
    op.drop_table('uploaders')
    # ### end Alembic commands ###
