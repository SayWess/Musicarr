from database.models import Playlist, PlaylistVideo, DownloadState, Video # Import your models
from sqlalchemy.ext.asyncio import AsyncSession
from utils.download_playlist_video import start_download_video

from websocket_manager import ws_manager
from database.database import SessionLocal
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload


downloading = {}


async def start_download_playlist(playlist_id: str, db: AsyncSession, redownloadAll: bool = False):
    """
    Récupère les informations d'une playlist et de ses vidéos associées via yt-dlp.

    Args:
        playlist_url (str): URL de la playlist YouTube.

    Returns:
        dict: Dictionnaire avec les informations de la playlist et des vidéos.
    """
    nb_download_failed = 0

    print(redownloadAll)

    # Re-fetch the playlist with videos and PlaylistVideo relation
    if redownloadAll:
        result = await db.execute(
            select(Playlist)
            .options(
                selectinload(Playlist.videos).selectinload(PlaylistVideo.video) 
            )
            .where(Playlist.id == playlist_id)
        )
        playlist = result.scalar_one_or_none()
    else:
        result = await db.execute(
            select(Playlist)
            .options(
                selectinload(Playlist.videos).selectinload(PlaylistVideo.video) 
            )
            .where(Playlist.id == playlist_id)
            .where(Playlist.videos.any(PlaylistVideo.state in [DownloadState.IDLE, DownloadState.ERROR]))  # Only select if not all videos are downloaded
        )
        playlist = result.scalar_one_or_none()
    
    print(f"Playlist: {playlist}")
    if not playlist:
        print(f"Playlist with ID {playlist_id} not found.")
        return "No video to download", 0



    print(f"Starting download for playlist: {playlist.title}")

    for playlist_video in playlist.videos:
        video = playlist_video.video
        if not video:
            continue

        print(f"Starting download for video: {video.title}")

        # Mark as DOWNLOADING
        playlist_video.state = DownloadState.DOWNLOADING
        await db.commit()
        await db.refresh(playlist_video)

        await ws_manager.send_message("playlists", {
            "playlist_id": playlist.source_id,
            "video_id": video.source_id,
            "status": "started"
        })

        try:
            result, stderr = await start_download_video(playlist, video)
        except Exception as e:
            print(f"Error downloading video {video.title}: {e}")
            result = None, 0

        # Update state based on result
        if result == 0:
            playlist_video.state = DownloadState.DOWNLOADED
        else:
            playlist_video.state = DownloadState.ERROR
            nb_download_failed += 1

        await db.commit()
        await db.refresh(playlist_video)

        if result == 0:
            await ws_manager.send_message("playlists", {
                "playlist_id": playlist.source_id,
                "video_id": video.source_id,
                "video_title": video.title,
                "status": "finished"
            })
        else:
            await ws_manager.send_message("playlists", {
                "playlist_id": playlist.source_id,
                "video_id": video.source_id,
                "video_title": video.title,
                "status": "error",
            })
    
    return nb_download_failed, len(playlist.videos)


    

async def download_playlist(playlist: Playlist, redownloadAll: bool = False):
    """
    Démarre le téléchargement de la playlist.
    """
    print(f"Starting download for playlist: {playlist.title}")
    downloading[playlist.source_id] = True
    
    async with SessionLocal() as db:
        try:
            result, total_to_download = await start_download_playlist(playlist.id, db, redownloadAll)
        except Exception as e:
            print(f"Error downloading playlist: {e}")
            result = None
    
    downloading.pop(playlist.source_id, None)
    if result == None:
        print(f"Failed to download {playlist.title}.")
        await ws_manager.send_message(
            "playlists", 
            {"playlist_id": playlist.source_id, "download_success": False, "playlist_title": playlist.title, "message": "Error while downloading the playlist" }
        )
    elif result == "No video to download": 
        await ws_manager.send_message(
            "playlists", 
            {"playlist_id": playlist.source_id, "download_success": True, "up_to_date": True, "playlist_title": playlist.title, "message": "Playlist downloaded successfully" }
        )
    else:
        await ws_manager.send_message(
            "playlists", 
            {"playlist_id": playlist.source_id, "download_success": True, "nb_download_failed": result, "total_to_download": total_to_download, "playlist_title": playlist.title, "message": "Playlist downloaded successfully" }
        )
