from database.models import PlaylistVideo, DownloadState, Video, Playlist
from sqlalchemy.ext.asyncio import AsyncSession
from utils.download_playlist_video import start_download_video
from websocket_manager import ws_manager
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

downloading_videos = {}

TEXT_VIDEO_NOT_FOUND = "Video not found"
TEXT_VIDEO_NOT_AVAILABLE = "Video not available"

async def start_download_single_video(playlist_id: str, video_id: str, db: AsyncSession):
    result = await db.execute(
        select(PlaylistVideo)
        .options(
            selectinload(PlaylistVideo.video), 
            selectinload(PlaylistVideo.playlist).selectinload(Playlist.uploader)
        )
        .where(PlaylistVideo.video_id == video_id, PlaylistVideo.playlist_id == playlist_id)
    )

    playlist_video = result.scalar_one_or_none()
    if not playlist_video or not playlist_video.video or not playlist_video.playlist:
        print(f"Video or playlist not found for video ID {video_id}")
        return TEXT_VIDEO_NOT_FOUND

    video: Video = playlist_video.video
    playlist: Playlist = playlist_video.playlist

    if video.available is False:
        print(f"Video {video.title} is not available for download.")
        return TEXT_VIDEO_NOT_AVAILABLE

    playlist_video.state = DownloadState.DOWNLOADING
    await db.commit()
    await db.refresh(playlist_video)

    await ws_manager.send_message("playlists", {
        "playlist_id": playlist.source_id,
        "video_id": video.source_id,
        "status": "started"
    })

    try:
        success, stderr = await start_download_video(playlist, video)
    except Exception as e:
        print(f"Error downloading video {video.title}: {e}")
        success = None

    playlist_video.state = DownloadState.DOWNLOADED if success else DownloadState.ERROR
    await db.commit()
    await db.refresh(playlist_video)

    await ws_manager.send_message("playlists", {
        "playlist_id": playlist.source_id,
        "video_id": video.source_id,
        "video_title": video.title,
        "status": "finished" if success else "error"
    })

    return success


async def download_video(playlist_video: PlaylistVideo, playlist: Playlist, video: Video):
    downloading_videos[(playlist_video.playlist_id, playlist_video.video_id)] = True

    from database.database import SessionLocal
    async with SessionLocal() as db:
        try:
            result = await start_download_single_video(playlist_video.playlist_id, playlist_video.video_id, db)
        except Exception as e:
            print(f"Error downloading video: {e}")
            result = None

            await ws_manager.send_message("playlists", {
                "playlist_id": playlist.source_id,
                "video_id": video.source_id,
                "video_title": video.title,
                "status": "error",
            })
    if result == TEXT_VIDEO_NOT_FOUND:
        await ws_manager.send_message("playlists", {
            "playlist_id": playlist.source_id,
            "video_id": video.source_id,
            "video_title": video.title,
            "status": "error",
            "message": TEXT_VIDEO_NOT_FOUND
        })
    elif result == TEXT_VIDEO_NOT_AVAILABLE:
        await ws_manager.send_message("playlists", {
            "playlist_id": playlist.source_id,
            "video_id": video.source_id,
            "video_title": video.title,
            "status": "error",
            "message": TEXT_VIDEO_NOT_AVAILABLE
        })

    downloading_videos.pop((playlist_video.playlist_id, playlist_video.video_id), None)
    return result
