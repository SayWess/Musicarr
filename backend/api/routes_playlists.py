from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import selectinload
from database.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc
from database.models import Playlist, PlaylistVideo, DownloadState, Video, Uploader
import asyncio
from utils.fetchPlaylistInfo import fetch_full_playlist
from utils.download_playlist import download_playlist
from pydantic import BaseModel
from typing import Optional

from websocket_manager import ws_manager


router = APIRouter()


VALID_SORT_FIELDS = {
    "title": Playlist.title,
    "last_published": Playlist.last_published,  # supposer que ce champ existe
    "created_at": Playlist.created_at,
    "uploader": Playlist.uploader_id,
}

@router.get("/")
async def get_playlists(
    db: AsyncSession = Depends(get_db),
    sort_by: str = Query("title", enum=["title", "last_update", "created_at", "state", "videos_count", "downloaded_count", "missing_count", "uploader"], description="Field to sort by"),
    order: str = Query("asc", enum=["asc", "desc"], description="Sort order"),
):
    # Aliases pour count custom
    downloaded_count = func.count(PlaylistVideo.id).filter(PlaylistVideo.state == DownloadState.DOWNLOADED).label("downloaded_count")
    missing_count = func.count(PlaylistVideo.id).filter(PlaylistVideo.state != DownloadState.DOWNLOADED).label("missing_count")
    videos_count = func.count(PlaylistVideo.id).label("videos_count")

    # Base query
    query = (
        select(
            Playlist.id,
            Playlist.source_id,
            Playlist.title,
            Playlist.thumbnail,
            Playlist.check_every_day,
            Playlist.last_published,
            Playlist.uploader_id,
            videos_count,
            downloaded_count,
            missing_count,
        )
        .outerjoin(Playlist.videos)
        .where(Playlist.source_id != "0")
        .group_by(Playlist.id)
    )

    # Ajout du tri
    if sort_by in ["downloaded_count", "missing_count", "videos_count"]:
        sort_column = {
            "downloaded_count": downloaded_count,
            "missing_count": missing_count,
            "videos_count": videos_count,
        }[sort_by]
    elif sort_by in VALID_SORT_FIELDS:
        sort_column = VALID_SORT_FIELDS[sort_by]
    else:
        sort_column = Playlist.title  # fallback

    query = query.order_by(asc(sort_column) if order == "asc" else desc(sort_column))

    # Execute and format
    result = await db.execute(query)
    playlists = result.all()

    return [
        {
            "id": row.source_id,
            "title": row.title,
            "thumbnail": row.thumbnail,
            "check_every_day": row.check_every_day,
            "last_published": row.last_published,
            "uploader_id": row.uploader_id,
            "missing_count": row.missing_count,
        }
        for row in playlists if row.source_id != 0
    ]


@router.get("/{playlist_id}")
async def get_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    """
    Récupérer une playlist par son ID
    """
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    playlist = result.scalars().first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist


@router.put("/{playlist_id}")
async def update_playlist(playlist_id: str, attributes_updated: dict, db: AsyncSession = Depends(get_db)):
    """
    Mettre à jour une playlist par son id
    """
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    playlist = result.scalars().first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Update the playlist fields
    for key, value in attributes_updated.items():
        setattr(playlist, key, value)
    
    # Commit the changes to the database
    await db.commit()

    await ws_manager.send_message("playlists", {"playlist_id": playlist_id, "options_updated": True})

    return {"message": f"Playlist updated", "playlist_id": playlist_id}


@router.delete("/{playlist_id}")
async def delete_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    """
    Supprimer une playlist par son ID
    """
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    playlist = result.scalars().first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Delete the playlist from the database
    await db.delete(playlist)
    await db.commit()

    return {"message": "Playlist deleted"}

@router.post("/{playlist_id}")
async def add_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    """
    Ajouter une playlist par son ID
    """
    # Check if the playlist already exists
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    existing_playlist = result.scalars().first()
    if existing_playlist:
        return {"message": "Playlist already exists", "error": True}

    # Start background task to fetch full playlist details
    asyncio.create_task(fetch_full_playlist(playlist_id))

    print("Playlist is being added")

    return {"message": "Playlist added", "playlist": "Being fetched..."}

class UpdateUploaderRequest(BaseModel):
    uploader_id: Optional[str] = None

@router.put("/{playlist_id}/uploader")
async def update_playlist_uploader(
    playlist_id: str,
    payload: UpdateUploaderRequest,
    db: AsyncSession = Depends(get_db)
):
    if not payload.uploader_id:
        raise HTTPException(status_code=400, detail="Uploader ID is required")
    
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    playlist = result.scalars().first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    print(payload)
    print(payload.uploader_id)
    uploader = await db.get(Uploader, payload.uploader_id)
    if not uploader:
        raise HTTPException(status_code=404, detail="Uploader not found")

    playlist.uploader_id = payload.uploader_id
    await db.commit()
    return {"detail": "Uploader updated successfully"}

@router.get("/{playlist_id}/details")
async def get_playlist_details(
    playlist_id: str,
    db: AsyncSession = Depends(get_db),
    sort_by: str = Query("upload_date", enum=["title", "upload_date", "state"]),
    order: str = Query("desc", enum=["asc", "desc"]),
):
    """
    Récupérer les détails d'une playlist avec l'info de l'uploader et les vidéos associées.
    """
    result = await db.execute(
        select(Playlist)
        .where(Playlist.source_id == playlist_id)
        .options(selectinload(Playlist.uploader))  # Load uploader relationship
    )
    playlist = result.scalars().first()
    
    if not playlist:
        if playlist_id == "0":
            # Create a new playlist instance
            playlist = Playlist(
                source_id=playlist_id,
                title="My videos",
            )

            # Add the new playlist to the database
            db.add(playlist)
            await db.commit()
        else :
            raise HTTPException(status_code=404, detail="Playlist not found")
    
    # Mapping of valid sort fields
    sort_column_map = {
        "title": Video.title,
        "upload_date": Video.upload_date,
        "state": PlaylistVideo.state,
    }

    sort_column = sort_column_map.get(sort_by, Video.upload_date)

    # Determine sort order
    sort_expression = sort_column.asc() if order == "asc" else sort_column.desc()

    # Fetch related videos correctly
    videos_result = await db.execute(
        select(Video, PlaylistVideo.state, PlaylistVideo.custom_title)
        .join(PlaylistVideo, PlaylistVideo.video_id == Video.id)
        .where(PlaylistVideo.playlist_id == playlist.id)
        .order_by(sort_expression)
    )
    videos = videos_result.all()


    return {
        "id": playlist.source_id,
        "title": playlist.title,
        "folder": playlist.folder,
        "download_path": playlist.download_path,
        "last_published": playlist.last_published,
        "thumbnail": playlist.thumbnail,
        "check_every_day": playlist.check_every_day,
        "default_format": playlist.default_format,
        "default_quality": playlist.default_quality,
        "default_subtitles": playlist.default_subtitles,
        "uploader": {
            "id": playlist.uploader.id,
            "name": playlist.uploader.name,
            "channel_url": playlist.uploader.channel_url,
        } if playlist.uploader else None,
        "videos": [
            {
                "id": video.source_id,
                "title": custom_title or video.title,
                "thumbnail": video.thumbnail,
                "duration": video.duration,
                "upload_date": video.upload_date,
                "available": video.available,
            }
            for video, state, custom_title in videos
        ]
    }

from sqlalchemy import case

@router.get("/{playlist_id}/number_of_videos_downloaded")
async def get_number_of_videos_downloaded(playlist_id: str, db: AsyncSession = Depends(get_db)):
    """
    Récupérer le nombre de vidéos téléchargées et le total de vidéos dans une playlist par son ID
    """
    stmt = (
        select(
            func.count(PlaylistVideo.id).label("total_videos"),
            func.count(
                case((PlaylistVideo.state == DownloadState.DOWNLOADED, 1))
            ).label("downloaded_videos")
        )
        .join(Playlist, PlaylistVideo.playlist_id == Playlist.id)
        .where(Playlist.source_id == playlist_id)
    )

    result = await db.execute(stmt)
    row = result.first()

    if row is None:
        raise HTTPException(status_code=404, detail="Playlist not found")

    return {
        "playlist_id": playlist_id,
        "downloaded_videos": row.downloaded_videos,
        "total_videos": row.total_videos
    }


@router.post("/{playlist_id}/refresh")
async def refresh_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    """
    Récupérer les vidéos d'une playlist par son ID
    """
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    playlist = result.scalars().first()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Start the refresh process
    asyncio.create_task(fetch_full_playlist(playlist_id, playlist.title))

    return {"message": "Refresh started", "playlist_id": playlist_id}

from utils.fetchPlaylistInfo import fetching
@router.get("/{playlist_id}/is_fetching")
async def is_fetching_playlist(playlist_id: str):
    """
    Vérifier si une playlist est en cours de téléchargement
    """
    if playlist_id in fetching:
        return {"message": "Playlist is being fetched", "is_fetching": True}
    else:
        return {"message": "Playlist is not being fetched", "is_fetching": False}
    

from utils.download_playlist import downloading

class DownloadRequest(BaseModel):
    redownload_all: Optional[bool] = False  # Default to False if not provided

@router.post("/{playlist_id}/download")
async def start_playlist_download(playlist_id: str, request_data: DownloadRequest, db: AsyncSession = Depends(get_db)):
    """
    Démarre le téléchargement de la playlist
    """
    # Correct fetch: select entire Playlist object
    result = await db.execute(
        select(Playlist).where(Playlist.source_id == playlist_id)
    )
    playlist = result.scalar_one_or_none()

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Check if the playlist is already being downloaded
    if playlist.source_id in downloading:
        raise HTTPException(status_code=400, detail="Playlist is already being downloaded")

    # Check if the playlist is being fetched
    if playlist.source_id in fetching:
        raise HTTPException(status_code=400, detail="Playlist is being fetched")

    redownload_all = request_data.redownload_all or False
    # Start the download process
    asyncio.create_task(download_playlist(playlist, redownload_all))

    return {"message": "Download started", "playlist_id": playlist_id}


@router.get("/{playlist_id}/download_status")
async def get_playlist_download_status(playlist_id: str):
    """
    Récupérer le statut de téléchargement d'une playlist par son ID
    """
    print(downloading)
    if playlist_id in downloading:
        return {"message": "Playlist is being downloaded", "is_downloading": True}
    else:
        return {"message": "Playlist is not being downloaded", "is_downloading": False}

from utils.download_video import download_video, downloading_videos
from utils.fetchVideoInfo import fetching_videos
@router.post("/{playlist_id}/videos/{video_id}/download")
async def start_video_download(playlist_id: str, video_id: str, db: AsyncSession = Depends(get_db)):
    """
    Démarre le téléchargement d'une vidéo par son ID
    """
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    playlist = result.scalars().first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found") 
    
    result = await db.execute(select(Video).where(Video.source_id == video_id))
    video = result.scalars().first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    result = await db.execute(
        select(PlaylistVideo)
        .where(PlaylistVideo.playlist_id == playlist.id, PlaylistVideo.video_id == video.id)
    )
    playlist_video = result.scalars().first()

    if not playlist_video:
        raise HTTPException(status_code=404, detail="Video not found in the playlist")
    
    if (playlist_video.playlist_id, playlist_video.video_id) in downloading_videos:
        raise HTTPException(status_code=400, detail="Video is already being downloaded")

    if video_id in fetching_videos:
        raise HTTPException(status_code=400, detail="Video is being fetched")

    # Start the download process for the specific video
    asyncio.create_task(download_video(playlist_video, playlist, video))

    return {"message": "Download started for video", "video_id": video_id}


@router.get("/{playlist_id}/videos/{video_id}/download_status")
async def get_video_download_status(playlist_id: str, video_id: str, db: AsyncSession = Depends(get_db)):
    """
    Récupérer le statut de téléchargement d'une vidéo par son ID
    """
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    playlist = result.scalars().first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    result = await db.execute(select(Video).where(Video.source_id == video_id))
    video = result.scalars().first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    result = await db.execute(
        select(PlaylistVideo)
        .where(PlaylistVideo.playlist_id == playlist.id, PlaylistVideo.video_id == video.id)
    )
    playlist_video = result.scalars().first()

    if not playlist_video:
        raise HTTPException(status_code=404, detail="Video not found in the playlist")

    # if playlist_video.state == DownloadState.DOWNLOADING and (playlist_id not in downloading or (playlist_video.playlist_id, playlist_video.video_id) in downloading_videos):
    #     playlist_video.state = DownloadState.IDLE
    #     await db.commit()
    # TODO fix when server is restarted when donloading a video / an item of a playlist, the status sometimes remains as DOWNLOADING

    return {
        "status": playlist_video.state,
        "video_id": video_id,
        "playlist_id": playlist_id
    }



@router.get("/{playlist_id}/videos/{video_id}")
async def get_playlist_video_info(playlist_id: str, video_id: str, db: AsyncSession = Depends(get_db)):
    """
    Return video info in a playlist by its ID
    """
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
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
        select(PlaylistVideo)
        .where(PlaylistVideo.playlist_id == playlist.id, PlaylistVideo.video_id == video.id)
    )
    playlist_video = result.scalars().first()

    if not playlist_video:
        print("Video not found in the playlist")
        raise HTTPException(status_code=404, detail="Video not found in the playlist")

    return {
        "video_id": video.source_id,
        "custom_title": playlist_video.custom_title or video.title,
        "custom_download_path": playlist_video.custom_download_path,
        "quality": playlist_video.quality,
        "subtitles": playlist_video.subtitles,
    }


@router.put("/{playlist_id}/videos/{video_id}")
async def update_playlist_video(playlist_id: str, video_id: str, attributes_updated: dict, db: AsyncSession = Depends(get_db)):
    """
    Mettre à jour une vidéo d'une playlist par son id
    """
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    playlist = result.scalars().first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    result = await db.execute(select(Video).where(Video.source_id == video_id))
    video = result.scalars().first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    result = await db.execute(
        select(PlaylistVideo)
        .where(PlaylistVideo.playlist_id == playlist.id, PlaylistVideo.video_id == video.id)
    )
    playlist_video = result.scalars().first()

    if not playlist_video:
        raise HTTPException(status_code=404, detail="Video not found in the playlist")

    # Update the playlist video fields
    for key, value in attributes_updated.items():
        if key == "custom_title" and value == video.title:
            value = None  # Reset to None if the custom title is the same as the original title
        
        setattr(playlist_video, key, value)
    
    # Commit the changes to the database
    await db.commit()

    await ws_manager.send_message("playlists", {
        "playlist_id": playlist.source_id,
        "video_id": video.source_id,
        "options_updated": True
    })

    return {"message": f"Playlist video updated", "video_id": video.source_id}
