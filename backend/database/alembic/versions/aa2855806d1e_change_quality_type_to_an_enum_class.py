"""Change quality type to an enum class

Revision ID: aa2855806d1e
Revises: bbfe62ddec03
Create Date: 2025-04-04 21:49:24.840381
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'aa2855806d1e'
down_revision = 'bbfe62ddec03'
branch_labels = None
depends_on = None

enum_name = 'downloadquality'

# Define the enum type for download quality
download_quality_enum = sa.Enum(
    'q_best', 'q_2160p', 'q_1440p', 'q_1080p', 'q_720p', 'q_480p', 'q_360p',
    name=enum_name
)


def upgrade():
    bind = op.get_bind()
    download_quality_enum.create(bind, checkfirst=False)

    # Update old values to new enum-compatible values
    update_map = {
        "best": "q_best",
        "2160p": "q_2160p",
        "1440p": "q_1440p",
        "1080p": "q_1080p",
        "720p": "q_720p",
        "480p": "q_480p",
        "360p": "q_360p",
        "4K": "q_2160p"
    }

    for old, new in update_map.items():
        bind.execute(
            sa.text("UPDATE playlist_videos SET quality = :new WHERE quality = :old"),
            {"old": old, "new": new}
        )
        bind.execute(
            sa.text("UPDATE playlists SET default_quality = :new WHERE default_quality = :old"),
            {"old": old, "new": new}
        )

    # Now safely cast to enum
    op.execute("ALTER TABLE playlist_videos ALTER COLUMN quality TYPE downloadquality USING quality::downloadquality")
    op.execute("ALTER TABLE playlists ALTER COLUMN default_quality TYPE downloadquality USING default_quality::downloadquality")


def downgrade():
    op.execute("ALTER TABLE playlists ALTER COLUMN default_quality TYPE VARCHAR USING default_quality::text")
    op.execute("ALTER TABLE playlist_videos ALTER COLUMN quality TYPE VARCHAR USING quality::text")
    download_quality_enum.drop(op.get_bind(), checkfirst=False)
