from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import re

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import func
from database.database import get_db
from database.models import DownloadState, Playlist, Video, Uploader, PlaylistVideo

from utils.fetchPlaylistInfo import fetch_and_store_playlist_info

app = FastAPI()

# Function to dynamically allow 192.168.*.* IPs
def allow_origin(origin: str) -> bool:
    return re.match(r"http://192\.168\.\d+\.\d+:3000$", origin) is not None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Static origins
    allow_origin_regex=r"http://192\.168\.\d+\.\d+:3000",  # Allow any 192.168.x.x:3000
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


# Stockage des connexions WebSocket
active_connections = {}

@app.websocket("/ws/playlists")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # if "playlists" not in active_connections:
    #     active_connections["playlists"] = []
    active_connections["playlists"] = websocket

    print(active_connections)

    try:
        while True:
            await websocket.receive_text()  # Attendre un message (optionnel)
    except WebSocketDisconnect:
        # active_connections["playlists"].remove(websocket)
        active_connections.pop("playlists", None)
        print("WebSocket disconnected")

# Gérer les connexions WebSocket
# @app.websocket("/ws/playlists/{playlist_id}")
# async def websocket_endpoint(websocket: WebSocket, playlist_id: str):
#     # print(f"WebSocket connection established for playlist {playlist_id}", websocket.headers)
#     await websocket.accept()
#     if playlist_id not in active_connections:
#         active_connections[playlist_id] = []
#     active_connections[playlist_id].append(websocket)

#     print(active_connections)
    
#     try:
#         while True:
#             await websocket.receive_text()  # Attendre un message (optionnel)
#     except WebSocketDisconnect:
#         active_connections[playlist_id].remove(websocket)


fetching = {}

from database.database import SessionLocal

async def fetch_full_playlist(playlist_id: str, playlist_title: str = None):
    """Fetch full playlist info in the background."""
    print(f"Fetching full playlist info for {playlist_id}...")
    # Check if already fetching
    if playlist_id in fetching:
        print(f"Already fetching playlist {playlist_id}.")
        return
    
    fetching[playlist_id] = True

    async with SessionLocal() as db:
        try: 
            # Fetch and store playlist info
            print(f"Fetching playlist info for {playlist_id}...")
            result = await fetch_and_store_playlist_info(playlist_id, db)
        except Exception as e:
            print(f"Error fetching playlist info: {e}")
            result = None
        finally:
            fetching.pop(playlist_id, None)
    
    if not result:
        print(f"Failed to fetch playlist info for {playlist_id}.")
        if "playlists" in active_connections:
            # for ws in :
            await active_connections["playlists"].send_json({"playlist_id": playlist_id, "fetch_success": False, "playlist_title": playlist_title, "message": "Failed to fetch playlist info" })
    else:
        print(f"Fetched full playlist info for {playlist_id}.")

        if "playlists" in active_connections:
            # for ws in active_connections["playlists"]:
            await active_connections["playlists"].send_json({"playlist_id": playlist_id, "fetch_success": True, "playlist_title": result, "message": "Fetched full playlist info" })




@app.get("/api")
def read_root():
    return {"message": "Welcome to the API"}

@app.get("/api/playlists")
async def get_playlists(db: AsyncSession = Depends(get_db)):
    """
    Récupérer la liste des playlists avec le nombre de vidéos non téléchargées (calculé via COUNT SQL)
    """
    # Query to fetch playlists with count of missing videos
    result = await db.execute(
        select(
            Playlist.source_id,
            Playlist.title,
            Playlist.thumbnail,
            Playlist.check_every_day,
            Playlist.folder,
            func.count(PlaylistVideo.id).filter(PlaylistVideo.state != DownloadState.DOWNLOADED).label("missing_videos"),
        )
        .outerjoin(Playlist.videos)  # Join to count related videos
        .group_by(Playlist.id)
    )

    playlists = result.all()

    # Convert to JSON-friendly response
    return [
        {
            "id": source_id,
            "title": title,
            "check_every_day": check_every_day,
            "thumbnail": thumbnail,  # Assuming thumbnail is stored as folder/id.jpg
            "folder": folder,
            "missing_videos": missing_videos
        }
        for source_id, title, thumbnail, check_every_day, folder, missing_videos in playlists if source_id != 0
    ]

@app.get("/api/playlists/{playlist_id}")
async def get_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    """
    Récupérer une playlist par son ID
    """
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    playlist = result.scalars().first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist
    
@app.put("/api/playlists/{playlist_id}")
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
    return {"message": f"Playlist updated", "playlist_id": playlist_id}

@app.post("/api/playlists/{playlist_id}")
async def add_playlist(playlist_id: str, db: AsyncSession = Depends(get_db)):
    """
    Ajouter une playlist par son ID
    """
    # Check if the playlist already exists
    result = await db.execute(select(Playlist).where(Playlist.source_id == playlist_id))
    existing_playlist = result.scalars().first()
    if existing_playlist:
        return {"message": "Playlist already exists", "error": True}

    # Create a new playlist instance
    new_playlist = Playlist(
        source_id=playlist_id,
        title="Fetching playlist " + playlist_id,
    )

    # Add the new playlist to the database
    db.add(new_playlist)
    await db.commit()

    print("Playlist committed")

    # Start background task to fetch full playlist details
    asyncio.create_task(fetch_full_playlist(playlist_id))

    print("Playlist added")

    return {"message": "Playlist added", "playlist": new_playlist}

@app.delete("/api/playlists/{playlist_id}")
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

@app.post("/api/playlists/{playlist_id}/refresh")
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

@app.get("/api/playlists/{playlist_id}/is_fetching")
async def is_fetching_playlist(playlist_id: str):
    """
    Vérifier si une playlist est en cours de téléchargement
    """
    if playlist_id in fetching:
        return {"message": "Playlist is being fetched", "is_fetching": True}
    else:
        return {"message": "Playlist is not being fetched", "is_fetching": False}

@app.post("/api/playlists/{playlist_id}/download")
async def start_playlist_download(playlist_id: str, db: AsyncSession = Depends(get_db)):
    """
    Récupérer le statut de téléchargement d'une playlist par son ID
    """
    result = await db.execute(select(Playlist.id).where(Playlist.source_id == playlist_id))
    playlist = result.scalars().first()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Start the download process
    asyncio.create_task(download_videos(playlist_id))

    return {"message": "Download started", "playlist_id": playlist_id}

@app.get("/api/playlists/{playlist_id}/details")
async def get_playlist_details(playlist_id: str, db: AsyncSession = Depends(get_db)):
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
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Fetch related videos correctly
    videos_result = await db.execute(
        select(Video)
        .join(PlaylistVideo, PlaylistVideo.video_id == Video.id)
        .where(PlaylistVideo.playlist_id == playlist.id)
    )
    videos = videos_result.scalars().all()

    return {
        "id": playlist.source_id,
        "title": playlist.title,
        "folder": playlist.folder,
        "last_published": playlist.last_published,
        "thumbnail": playlist.thumbnail,
        "check_every_day": playlist.check_every_day,
        "uploader": {
            "id": playlist.uploader.id if playlist.uploader else None,
            "name": playlist.uploader.name if playlist.uploader else "Unknown",
            "channel_url": playlist.uploader.channel_url if playlist.uploader else None,
        },
        "videos": [
            {
                "id": video.source_id,
                "title": video.title,
                "thumbnail": video.thumbnail,
                "duration": video.duration,
                "upload_date": video.upload_date,
            }
            for video in videos
        ]
    }




@app.get("/api/playlists/{playlist_id}/videos")
async def get_playlist_videos(playlist_id: str, db: AsyncSession = Depends(get_db)):
    """
    Récupérer les vidéos d'une playlist par son ID
    """
    result = await db.execute(
        select(Playlist)
        .where(Playlist.source_id == playlist_id)
        .options(selectinload(Playlist.videos))  # Load videos relationship
    )
    playlist = result.scalars().first()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    return [
        {
            "id": video.id,
            "title": video.title,
            "state": video.state,
            "progress": video.progress,
            "downloaded": video.downloaded,
        }
        for video in playlist.videos
    ]

@app.get("/api/playlists/{playlist_id}/videos/{video_id}")
async def get_playlist_video(playlist_id: str, video_id: str, db: AsyncSession = Depends(get_db)):
    """
    Récupérer une vidéo d'une playlist par son ID
    """
    result = await db.execute(
        select(Playlist)
        .where(Playlist.source_id == playlist_id)
        .options(selectinload(Playlist.videos))  # Load videos relationship
    )
    playlist = result.scalars().first()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    video = next((video for video in playlist.videos if video.id == video_id), None)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return {
        "id": video.id,
        "title": video.title,
        "state": video.state,
        "progress": video.progress,
        "downloaded": video.downloaded,
    }

@app.post("/api/playlists/{playlist_id}/videos/{video_id}/download")
async def start_playlist_video_download(playlist_id: str, video_id: str, db: AsyncSession = Depends(get_db)):
    """
    Récupérer le statut de téléchargement d'une vidéo d'une playlist par son ID
    """
    result = await db.execute(
        select(Playlist)
        .where(Playlist.source_id == playlist_id)
        .options(selectinload(Playlist.videos))  # Load videos relationship
    )
    playlist = result.scalars().first()
    
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    video = next((video for video in playlist.videos if video.id == video_id), None)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Start the download process
    asyncio.create_task(download_video(playlist_id, video_id))

    return {"message": "Download started", "video_id": video_id}


@app.get("/api/videos")
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

@app.post("/api/videos/{video_id}")
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


