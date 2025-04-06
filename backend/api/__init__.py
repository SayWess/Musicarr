# api/__init__.py
from fastapi import APIRouter
from .routes_playlists import router as playlist_router
from .routes_videos import router as video_router

api_router = APIRouter()
api_router.include_router(playlist_router, prefix="/playlists", tags=["playlists"])
api_router.include_router(video_router, prefix="/videos", tags=["videos"])
