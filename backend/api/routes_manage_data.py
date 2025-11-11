from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from api.routes_videos import add_video
from api.routes_playlists import add_playlist
from database.models import Playlist, PlaylistVideo, Video
from database.database import get_db
from sqlalchemy import insert, select
import json
import os
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")


router = APIRouter()


@router.get("/export")
async def export_data(db: AsyncSession = Depends(get_db)):
    # Get ids of playlists
    result = await db.execute(
        select(Playlist.source_id).where(Playlist.source_id != "0")
    )
    playlists_ids = result.scalars().all()


    result = await db.execute(
        select(Playlist.id).where(Playlist.source_id == "0")
    )
    playlist_for_videos = result.scalars().first()

    video_ids = []
    if playlist_for_videos:
        result = await db.execute(
            select(Video.source_id).join(PlaylistVideo).where(PlaylistVideo.playlist_id == playlist_for_videos)
        )
        video_ids = result.scalars().all()

    # Generate json file to download
    json_data = {
        "playlists": playlists_ids,
        "videos": video_ids
    }

    timestr = time.strftime("%Y%m%d-%H%M%S")
    file_name = "Musicarr_item_ids-{}.json".format(timestr)

    SAVE_FILE_PATH = os.path.join(UPLOAD_DIR, file_name)
    print("Saving export file to:", SAVE_FILE_PATH)

    with open(SAVE_FILE_PATH, "w") as f:
        json.dump(json_data, f, indent=4)

    
    # Return as a download
    return FileResponse(
        path=SAVE_FILE_PATH,
        media_type="application/json",
        filename=file_name,
    )


@router.post("/upload")
async def upload_app_data(file: UploadFile, db: AsyncSession = Depends(get_db)):
    if file.content_type != "application/json":
        raise HTTPException(400,detail="Invalid document type. Expected a .json file")
    else:
        json_data = json.loads(file.file.read())
        if "playlists" not in json_data or "videos" not in json_data:
            raise HTTPException(400, detail="Invalid JSON structure")

        for playlist_id in json_data["playlists"]:
            await add_playlist(playlist_id, db)

        for video_id in json_data["videos"]:
            await add_video(video_id, db)

        return {"success": True}

