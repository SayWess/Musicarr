from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from database.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.models import Playlist, Video
import asyncio

router = APIRouter()



@router.get("/")
async def get_independant_videos(db: AsyncSession = Depends(get_db)):
    """
    Récupérer la liste des vidéos présentes dans playlist (source_id = 0) qui sert à stocker les videos ne faisant pas partie d'une playlist
    """
    result = await db.execute(
        select(Video)
        .options(selectinload(Video.playlists))
        .where(Playlist.source_id == 0)
    )
    videos = result.scalars().all()
    if not videos:
        raise HTTPException(status_code=404, detail="No videos found")
    
    # Convert to JSON-friendly response
    return [
        {
            "id": video.source_id,
            "title": video.title,
            "state": video.state,
        }
        for video in videos
    ]


@router.post("/{video_id}")
async def add_video(video_id: str, db: AsyncSession = Depends(get_db)):
    """
    Ajouter une vidéo par son ID
    """
    result = db.execute(select(Video).where(Video.source_id == video_id))
    existing_video = result.scalars().first()
    if existing_video:
        return {"message": "Video already exists", "error": True}
    
    # Create a new video instance
    video = Video(
        source_id=video_id,
        title= "Fetching video...",
    )
    # Add the new video to the database
    db.add(video)
    await db.commit()
    # Start background task to fetch full video details
    asyncio.create_task(fetch_full_video(video_id))
    return {"message": "Video added", "video": video}