from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.inspection import inspect
from sqlalchemy.ext.asyncio import AsyncSession
from api.routes_videos import add_video
from api.routes_playlists import add_playlist
from database.models import Playlist, PlaylistVideo, Video, GlobalPreferences
from database.database import get_db
from sqlalchemy import insert, select, Boolean
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


@router.get("/global_preferences")
async def get_global_preferences( db: AsyncSession = Depends(get_db)):
    """
    Retrieve the global preferences for the application. 
    
    Contains the attributes to update when a playlist or a video is updated.

    Returns:
        GlobalPreferences: The existing or newly created global preferences row.
    """
    global_preferences = (await db.execute(select(GlobalPreferences).except_())).scalar_one_or_none()
    if not global_preferences:
        global_preferences = GlobalPreferences()
        db.add(global_preferences)
        await db.commit()

    return global_preferences


@router.post("/global_preferences")
async def update_global_preferences(attributes_updated: dict, db: AsyncSession = Depends(get_db)):
    """
    Update one or multiple global preference fields. 
    
    Used for setting which 
    parameters of a video or of a playlist to update when it is refreshed

    This endpoint accepts a dictionary of key/value pairs and applies updates
    to the `GlobalPreferences` row. Only attributes that exist in the SQLAlchemy
    model and whose types are valid will be updated.

    Behavior:
        - If no preferences row exists, a new one is created.
        - Unknown keys trigger a 400 error.
        - Boolean fields accept:
            * Python `True` / `False`
            * string `"true"` / `"false"` (case-sensitive)
        - Any invalid type for a field raises a 400 error.

    Example payload:
        {
            "update_playlist_title": false,
            "update_video_thumbnail": "true"
        }

    Args:
        attributes_updated (dict):
            Dictionary of preference keys and values to update.
        db (AsyncSession):
            Database session.

    Returns:
        dict: {"updated": True}

    Raises:
        HTTPException 400:
            - If a field name does not exist on the model.
    """
    global_preferences = (await db.execute(select(GlobalPreferences))).scalar_one_or_none()
    if not global_preferences:
        global_preferences = GlobalPreferences()
        db.add(global_preferences)

    mapper = inspect(GlobalPreferences)

    for key, value in attributes_updated.items():
        if not hasattr(global_preferences, key):
            raise HTTPException(400, detail=f"Invalid key: {key}")
        
        column = mapper.columns[key]

        if isinstance(column.type, Boolean):
            if value == "true":
                value = True
            elif value == "false":
                value = False
            else:
                raise HTTPException(400, detail=f"Invalid type for '{key}', expected bool or string bool")
            
        setattr(global_preferences, key, value)
    
    await db.commit()
    
    return {"updated": True}
