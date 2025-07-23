from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from database.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.models import Playlist, Video, PlaylistVideo
import asyncio
from utils.fetchVideoInfo import fetch_full_video, fetching_videos


router = APIRouter()


@router.get("/")
async def get_independant_videos(db: AsyncSession = Depends(get_db)):
    """
    Récupérer la liste des vidéos présentes dans playlist (source_id = 0) qui sert à stocker les videos ne faisant pas partie d'une playlist
    """
    result = await db.execute(
        select(Video)
        .options(selectinload(Video.playlists))
        .where(Playlist.source_id == "0")
    )
    videos = result.scalars().all()
    if not videos:
        raise HTTPException(status_code=404, detail="No videos found")
    
    # Convert to JSON-friendly response
    return [
        {
            "id": video.source_id,
            "title": video.title,
            "state": video.available,
        }
        for video in videos
    ]


@router.post("/{video_id}")
async def add_video(video_id: str, db: AsyncSession = Depends(get_db)):
    """
    Ajouter une vidéo par son ID
    """
    new_video = False
    result = await db.execute(select(Video).where(Video.source_id == video_id))
    video = result.scalars().first()
    if not video: 
        new_video = True
        # Create a new video instance
        video = Video(
            source_id=video_id,
            title= "Fetching video...",
        )
        # Add the new video to the database
        db.add(video)
        await db.commit()

    result = await db.execute(select(Playlist).filter(Playlist.source_id == "0"))
    playlist = result.scalars().first()

    #Link it to default playlist with id 0
    result = await db.execute(
         select(PlaylistVideo).filter(
            PlaylistVideo.playlist_id == playlist.id,
            PlaylistVideo.video_id == video.id
        )
    )
    existing_relation = result.scalars().first()

    if existing_relation:
        return {"message": "Video already exists", "error": True}
  
    playlist_video = PlaylistVideo(
        playlist_id=playlist.id,
        video_id=video.id,
    )
    db.add(playlist_video)

    await db.commit()

    # Start background task to fetch full video details
    if new_video:
        print(f"Starting background task to fetch full video details for {video_id}...")
        asyncio.create_task(fetch_full_video(video_id))


    return {"message": "Video added", "video": video}


@router.delete("/{video_id}")
async def delete_video_from_default_playlist(video_id: str, db: AsyncSession = Depends(get_db)):
    """
    Supprimer une vidéo par son ID
    """
    if video_id in fetching_videos:
        print(f"Video {video_id} is currently being fetched. Cannot delete.")
        raise HTTPException(status_code=400, detail="Video is currently being fetched")
    result = await db.execute(select(Playlist).filter(Playlist.source_id == "0"))
    playlist = result.scalars().first()
    if not playlist:
        print("Playlist not found")
        raise HTTPException(status_code=404, detail="Playlist not found")
    result = await db.execute(select(Video).where(Video.source_id == video_id))
    video = result.scalars().first()
    if not video:
        print("Video not found")
        raise HTTPException(status_code=404, detail="Video not found")
    
    result = await db.execute(
        select(PlaylistVideo).filter(
            PlaylistVideo.playlist_id == playlist.id,
            PlaylistVideo.video_id == video.id
        )
    )
    existing_relation = result.scalars().first()

    if not existing_relation:
        print("Video not found in playlist")
        raise HTTPException(status_code=404, detail="Video not found in playlist")
    
    print("Deleting video from playlist")
    # Delete the relationship entry
    await db.delete(existing_relation)
    await db.commit()

    result = await db.execute(
        select(PlaylistVideo).filter(
            PlaylistVideo.video_id == video.id
        )
    )
    existing_relation = result.scalars().first()

    if not existing_relation:
        print("Deleting video from db")
        # Delete the video from the db
        await db.delete(video)
        await db.commit()

    return {"message": "Video deleted"}

@router.get("/{video_id}/is_fetching")
async def is_video_fetching(video_id: str):
    """
    Vérifier si une vidéo est en cours de récupération
    """
    if video_id in fetching_videos:
        return {"is_fetching": True}
    else:
        return {"is_fetching": False}
