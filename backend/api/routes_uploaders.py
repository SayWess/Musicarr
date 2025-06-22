from fastapi import APIRouter, Depends, HTTPException, Query
from database.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.models import Uploader
import asyncio

router = APIRouter()

from fastapi.staticfiles import StaticFiles

router.mount("/avatars", StaticFiles(directory="metadata/avatars"), name="avatars")

@router.get("/")
async def get_uploaders(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(100, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get a list of uploaders.
    """
    result = await db.execute(
        select(Uploader)
        .limit(limit)
        .offset(offset)
    )
    print(f"Uploaders: {result}")
    uploaders = result.scalars().all()

    if not uploaders:
        raise HTTPException(status_code=404, detail="No uploaders found")

    return uploaders

# Command to download just uploader's avatar
# yt-dlp https://www.youtube.com/@wotaku --write-thumbnail --playlist-items 0 --skip-download -o "%(channel)s.%(ext)s
# Download all avatar and channel banners
# yt-dlp "https://www.youtube.com/@{channel}" --write-all-thumbnails --playlist-items 0 --skip-downloads

from utils.download_uploader_avatar import download_avatar, downloading

@router.post("/{uploader_id}/download_avatar")
async def download_uploader_avatar(
    uploader_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Start downloading the avatar of a specific uploader.
    """
    result = await db.execute(
        select(Uploader)
        .where(Uploader.id == uploader_id)
    )
    uploader = result.scalar_one_or_none()

    if not uploader:
        raise HTTPException(status_code=404, detail="Uploader not found")
    
    if uploader.id in downloading:
        raise HTTPException(status_code=400, detail="Avatar download already in progress")

    print(f"Starting download avatar for uploader: {uploader.name}")

    # Download the uploader's avatar
    asyncio.create_task(download_avatar(uploader))

    return {"message": "Avatar download started"}

@router.get("/{uploader_id}/download_avatar/status")
async def get_uploader_avatar_state(
    uploader_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get the state of the avatar download for a specific uploader.
    """
    result = await db.execute(
        select(Uploader)
        .where(Uploader.id == uploader_id)
    )
    uploader = result.scalar_one_or_none()

    if not uploader:
        raise HTTPException(status_code=404, detail="Uploader not found")

    if uploader.id in downloading:
        return {"status": "downloading"}
    
    return {"status": "not downloading"}