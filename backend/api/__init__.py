# api/__init__.py
from fastapi import APIRouter
from .routes_playlists import router as playlist_router
from .routes_videos import router as video_router
from .routes_uploaders import router as uploaders_router
from .routes_paths import router as paths_router
from .routes_manage_data import router as manage_data_router

api_router = APIRouter()
api_router.include_router(playlist_router, prefix="/playlists", tags=["playlists"])
api_router.include_router(video_router, prefix="/videos", tags=["videos"])
api_router.include_router(uploaders_router, prefix="/uploaders", tags=["uploaders"])
api_router.include_router(paths_router, prefix="/paths", tags=["paths"])
api_router.include_router(manage_data_router, prefix="/manage_data", tags=["manage_data"])

