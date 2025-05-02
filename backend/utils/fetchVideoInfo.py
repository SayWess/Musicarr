from database.models import Video, Uploader, PlaylistVideo, Playlist  # Import your models
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from websocket_manager import ws_manager
from database.database import SessionLocal

from utils.download_uploader_avatar import download_uploader_avatar
from utils.fetch_item_info import fetch_item_info


fetching_videos = {}


async def fetch_and_store_video_info(video_id, db: AsyncSession):
    """
    Fetches and stores playlist and videos to the database.

    Args:
        playlist_url (str): URL of the playlist.
        db_session (Session): SQLAlchemy session to interact with the database.
    
    Returns:
        bool: True if the playlist and videos were added successfully, else False.
    """
    # Step 1: Fetch playlist info using yt-dlp (can use your existing method)
    video_info = await fetch_item_info(video_id)
    if not video_info:
        print("Failed to fetch video info.")
        return False

    # Step 2: Check if the uploader exists or create a new uploader
    result = await db.execute(
        select(Uploader).filter(Uploader.channel_id == video_info.get("channel_id"))
    )
    uploader = result.scalars().first()  # Extract single result

    if not uploader:
        # Create a new uploader if not found
        if video_info.get("channel_id") and video_info.get("uploader"):
            uploader = Uploader(
                channel_id=video_info.get("channel_id"),
                name=video_info.get("uploader"),
                channel_url=video_info.get("channel_url") or f"https://www.youtube.com/channel/{video_info.get('channel_id')}"
            )
            db.add(uploader)
            await db.flush()
            print("Created new uploader:", uploader.name)

            print("Downloading uploader avatar...")
            await download_uploader_avatar(uploader.id, db)  # Download the uploader's avatar
    
            await db.commit()  # Commit uploader creation
        
    
    print("Video id", video_info.get("id"))
    result = await db.execute(
        select(Video).filter(Video.source_id == video_info.get('id'))
    )
    video = result.scalars().first()

    if not video:
        result = await db.execute(
            select(Uploader).filter(Uploader.channel_id == video_info.get("channel_id"))
        )
        uploader = result.scalars().first()
        print("Adding a video ", video_info.get("title"))
            
        if uploader:
            if uploader.source_id is None:
                uploader.source_id = video_info.get("uploader_id")
                uploader.url = video_info.get("uploader_url")
        else:
            # Create a new uploader if not found
            if video_info.get("uploader") and video_info.get("channel_id"):
                uploader = Uploader(
                    source_id=video_info.get("uploader_id"),
                    name=video_info.get("uploader"),
                    url=video_info.get("uploader_url"),
                    channel_id=video_info.get("channel_id"),
                    channel_url=video_info.get("channel_url") or f"https://www.youtube.com/channel/{video_info.get('uploader_id')}"
                )
                db.add(uploader)
                print("Created new uploader:", uploader.name)
                print("Downloading uploader avatar...")
                await download_uploader_avatar(uploader.id, db)
        await db.commit()  # Commit uploader creation

        # If the video is not in the database, create a new video
        video = Video(
            source_id=video_info.get("id"),
            title=video_info.get("title"),
            description=video_info.get("description"),
            thumbnail=video_info.get("thumbnail"),
            upload_date=video_info.get("upload_date"),
            duration=video_info.get("duration_string"),
            uploader_id=uploader.id if uploader else None  # Link the uploader to the video
        )
        db.add(video)
        await db.flush()
        print("Created new video:", video.title)

    else:
        # Update existing video info
        video.title = video_info.get("title")
        video.description = video_info.get("description")
        video.thumbnail = video_info.get("thumbnail")
        video.upload_date = video_info.get("upload_date")
        video.duration = video_info.get("duration_string")
        if uploader:
            video.uploader_id = uploader.id

    # Step 5: Create the relationship entry between Playlist and Video
    result = await db.execute(
        select(Playlist).filter(Playlist.source_id == "0")
    )
    playlist = result.scalars().first()
    if not playlist:
        print("Playlist not found")
        return False


    result = await db.execute(
        select(PlaylistVideo).filter(
            PlaylistVideo.playlist_id == playlist.id,
            PlaylistVideo.video_id == video.id
        )
    )
    existing_relation = result.scalars().first()

    if not existing_relation:
        playlist_video = PlaylistVideo(
            playlist_id=playlist.id,
            video_id=video.id,
        )
        db.add(playlist_video)


    # Step 6: Commit all PlaylistVideo entries
    await db.commit()

    return video.title


async def fetch_full_video(video_id: str, video_title: str = None):
    """Fetch full video info in the background."""
    print(f"Fetching full video info for {video_id}...")
    # Check if already fetching
    if video_id in fetching_videos:
        print(f"Already fetching video {video_id}.")
        return
    
    fetching_videos[video_id] = True

    async with SessionLocal() as db:
        try: 
            # Fetch and store video info
            print(f"Fetching video info for {video_id}...")
            result = await fetch_and_store_video_info(video_id, db)
        except Exception as e:
            print(f"Error fetching video info: {e}")
            result = None

            # Remove video
            result = await db.execute(
                select(Video).filter(Video.source_id == video_id)
            )
            video = result.scalars().first()
            if video:
                await db.delete(video)
                await db.commit()
                print(f"Deleted video {video_id} from database.")

        finally:
            fetching_videos.pop(video_id, None)
    
    if not result:
        print(f"Failed to fetch video info for {video_id}.")
        await ws_manager.send_message(
            "playlists", 
            {"playlist_id": "0", "fetch_success": False, "message": f"Failed to fetch info for video : {video_title or video_id}" }
        )
    else:
        print(f"Fetched full playlist info for {video_id}.")

        await ws_manager.send_message(
            "playlists", 
            {"playlist_id": "0", "fetch_success": True, "message": f"Successfully fetched info for video : {video_title or video_id}" }
        )
