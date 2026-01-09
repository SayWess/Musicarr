from database.models import Playlist, PlaylistVideo, Video, DownloadState, RootFolder # Import your models
from sqlalchemy.ext.asyncio import AsyncSession
from utils.download_playlist_video import start_download_video

from websocket_manager import ws_manager
from database.database import SessionLocal
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload


downloading = {}

TEXT_NO_ROOT_FOLDER = "No root folder found"
TEXT_NO_VIDEO_TO_DOWNLOAD = "No video to download"


async def start_download_playlist(playlist_id: str, db: AsyncSession, redownloadAll: bool = False):
    """
    Récupère les informations d'une playlist et de ses vidéos associées via yt-dlp.

    Args:
        playlist_url (str): URL de la playlist YouTube.

    Returns:
        dict: Dictionnaire avec les informations de la playlist et des vidéos.
    """

    # Re-fetch the playlist with videos and PlaylistVideo relation
    if redownloadAll:
        result = await db.execute(
            select(Playlist)
            .options(
                selectinload(Playlist.videos).selectinload(PlaylistVideo.video),
                selectinload(Playlist.uploader)
            )
            .where(Playlist.id == playlist_id)
        )
        playlist = result.scalar_one_or_none()
    else:
        print(f"Fetching playlist with ID {playlist_id}...")
        result = await db.execute(
            select(Playlist)
            .options(
                selectinload(Playlist.videos).selectinload(PlaylistVideo.video),
                selectinload(Playlist.uploader)
            )
            .where(Playlist.id == playlist_id)
            .where(Playlist.videos.any(PlaylistVideo.state.in_([DownloadState.IDLE, DownloadState.ERROR])))  # Only select if not all videos are downloaded
        )
        
        playlist = result.scalar_one_or_none()

    
    print(f"Playlist: {playlist}")
    if not playlist:
        print(f"Playlist with ID {playlist_id} not found.")
        return TEXT_NO_VIDEO_TO_DOWNLOAD, 0
    
    # Check download path is correct (in a root folder)
    result = await db.execute(select(RootFolder).where(RootFolder.path == playlist.folder))
    root_folder = result.scalar_one_or_none()
    if not root_folder:
        # Set default folder if not found
        print(f"Root folder for playlist {playlist.title} not found, setting to default.")
        root_folder = await db.execute(select(RootFolder).where(RootFolder.is_default == True))
        root_folder = root_folder.scalar_one_or_none()
        if not root_folder:
            print("No default root folder found, cannot download playlist.")
            return TEXT_NO_ROOT_FOLDER, 0
        
        playlist.folder = root_folder.path
        await db.commit()
        await db.refresh(playlist)
    
    nb_download_failed = 0
    nb_videos_to_download = 0
    print(f"Starting download for playlist: {playlist.title}")

    for playlist_video in playlist.videos:
        playlist_video: PlaylistVideo
        if not redownloadAll and playlist_video.state not in [DownloadState.IDLE, DownloadState.ERROR]:
            continue
        
        video: Video = playlist_video.video
        if not video or video.available is False:
            continue

        nb_videos_to_download += 1
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
            success, stderr = await start_download_video(playlist, video, playlist_video)
        except Exception as e:
            print(f"Error downloading video {video.title}: {e}")
            success = None

        # Update state based on result
        if success:
            playlist_video.state = DownloadState.DOWNLOADED
        else:
            playlist_video.state = DownloadState.ERROR
            nb_download_failed += 1

        await db.commit()
        await db.refresh(playlist_video)

        await ws_manager.send_message("playlists", {
            "playlist_id": playlist.source_id,
            "video_id": video.source_id,
            "video_title": video.title,
            "status": "finished" if success else "error"
        })
    
    return nb_download_failed, nb_videos_to_download



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
    elif result == TEXT_NO_VIDEO_TO_DOWNLOAD: 
        await ws_manager.send_message(
            "playlists", 
            {"playlist_id": playlist.source_id, "download_success": True, "up_to_date": True, "playlist_title": playlist.title, "message": "Playlist already up to date" }
        )
    elif result == TEXT_NO_ROOT_FOLDER:
        await ws_manager.send_message(
            "playlists",
            {"playlist_id": playlist.source_id, "download_success": False, "playlist_title": playlist.title, "message": "No root folder found for this playlist, please add one or create a default root folder" }
        )
    else:
        await ws_manager.send_message(
            "playlists", 
            {"playlist_id": playlist.source_id, "download_success": True, "nb_download_failed": result, "total_to_download": total_to_download, "playlist_title": playlist.title, "message": "Playlist downloaded successfully" }
        )
