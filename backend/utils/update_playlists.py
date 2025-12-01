from utils.fetchPlaylistInfo import fetch_full_playlist
from database.database import SessionLocal
from database.models import Playlist
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from utils.download_playlist import download_playlist


async def update_playlists_info_task(db: AsyncSession):
    """Task to update playlists info."""

    playlists = await db.execute(select(Playlist))
    playlists = playlists.scalars().all()
    
    for playlist in playlists:
        try:
            await fetch_full_playlist(playlist.source_id, playlist.title)
        except Exception as e:
            print(f"Error fetching playlist {playlist.source_id}: {e}")
            continue

    print("All playlists updated successfully.")

async def update_playlists_info_job():
    """Job to update playlists info."""
    async with SessionLocal() as db:
        await update_playlists_info_task(db)
    print("Playlists info updated successfully.")

async def update_playlists_downloads(db: AsyncSession):
    """Task to download new items in playlists."""

    playlists = await db.execute(select(Playlist).where(Playlist.check_every_day))
    playlists = playlists.scalars().all()

    for playlist in playlists:
        try:
            await fetch_full_playlist(playlist.source_id, playlist.title)
            await download_playlist(playlist)
        except Exception as e:
            print(f"Error fetching playlist {playlist.source_id}: {e}")
            continue

    print("All playlists updated successfully.")

async def update_playlists_downloads_job():
    """Job to update playlists downloads."""
    async with SessionLocal() as db:
        await update_playlists_downloads(db)
    print("Playlists downloads updated successfully.")
