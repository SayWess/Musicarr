from database.models import DownloadState, Playlist, RootFolder, Video, Uploader, PlaylistVideo  # Import your models
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from websocket_manager import ws_manager
from database.database import SessionLocal

from utils.constants import MNT_PATH
from utils.sanitize import sanitize_title
from utils.download_uploader_avatar import download_uploader_avatar
from utils.youtube_api import get_playlist_info, get_playlist_items, get_video_details


fetching = {}


async def fetch_and_store_playlist_info(playlist_id, db: AsyncSession):
    """
    Fetches and stores playlist and videos to the database.

    Args:
        playlist_url (str): URL of the playlist.
        db_session (Session): SQLAlchemy session to interact with the database.
    
    Returns:
        bool: True if the playlist and videos were added successfully, else False.
    """
    # Step 1: Fetch playlist info using youtube API
    playlist_snippet = await get_playlist_info(playlist_id)
    if not playlist_snippet:
        print("Failed to fetch playlist info.")
        return False

    playlist_snippet = playlist_snippet["snippet"]
    playlist_info = {
        "id": playlist_id,
        "title": playlist_snippet["title"],
        "description": playlist_snippet.get("description", ""),
        "channel_id": playlist_snippet["channelId"],
        "uploader": playlist_snippet["channelTitle"],
        "channel_url": f"https://www.youtube.com/channel/{playlist_snippet['channelId']}"
    }

    entries_raw = await get_playlist_items(playlist_id)
    video_ids = [item["contentDetails"]["videoId"] for item in entries_raw]
    video_details = await get_video_details(video_ids)

    playlist_info["entries"] = []
    for item in entries_raw:
        vid = item["contentDetails"]["videoId"]
        details = video_details.get(vid)
        if not details or details == {}:
            continue

        playlist_info["entries"].append(details)


    # Step 2: Check if the uploader exists or create a new uploader
    result = await db.execute(
        select(Uploader).filter(Uploader.channel_id == playlist_info.get("channel_id"))
    )
    uploader = result.scalars().first()

    if not uploader:
        # Create a new uploader if not found
        if playlist_info.get("channel_id") and playlist_info.get("uploader"):
            uploader = Uploader(
                channel_id=playlist_info.get("channel_id"),
                name=playlist_info.get("uploader"),
                channel_url=playlist_info.get("channel_url") or f"https://www.youtube.com/channel/{playlist_info.get('channel_id')}"
            )
            db.add(uploader)
            await db.flush()
            print("Created new uploader:", uploader.name)

            print("Downloading uploader avatar...")
            await download_uploader_avatar(uploader.id, db)  # Download the uploader's avatar
    
            await db.commit()  # Commit uploader creation
        
    

    # Step 3: Create the playlist entry
    result = await db.execute(
        select(Playlist).filter(Playlist.source_id == playlist_info.get("id"))
    )
    playlist = result.scalars().first()

    first_entry = playlist_info.get("entries", [])[0]  if playlist_info.get("entries") else {}

    last_published = max([video.get("upload_date") for video in playlist_info.get("entries", []) if video]) or None

    if playlist:
       # Update existing playlist
        playlist.title = sanitize_title(playlist_info.get("title"))
        playlist.description = playlist_info.get("description")
        playlist.thumbnail = first_entry.get("thumbnail")
        playlist.last_published = last_published
        playlist.uploader_id=uploader.id if uploader else None

        print("Updated existing playlist:", playlist.title)
    
    else:
        result = await db.execute(
            select(RootFolder).filter(RootFolder.is_default == True) 
        )
        root_folder = result.scalars().first()
        if not root_folder:
            root_folder = RootFolder(
                name="Default",
                path=MNT_PATH,
                is_default=True
            )
            db.add(root_folder)
            await db.flush()  # Flush to get the root folder ID
            print("Created default root folder:", root_folder.path)

        # Create new playlist if it doesn't exist
        playlist = Playlist(
            source_id=playlist_info.get("id"),
            title=sanitize_title(playlist_info.get("title")),
            description=playlist_info.get("description"),
            thumbnail=first_entry.get("thumbnail"),
            uploader_id=uploader.id if uploader else None,
            last_published=last_published,
            folder=root_folder.path,
        )
        db.add(playlist)
        await db.flush() # Flush to get the playlist ID
        print("Created new playlist:", playlist.title)

    await db.commit()  # Commit playlist modification

    print("Playlist commited")

    # Step 4: Process each video in the playlist
    for entry in playlist_info.get("entries", []):
        if not entry:
            print("No video found in entry:", entry)
            continue

        print("Video id", entry.get("id"))
        result = await db.execute(
            select(Video).filter(Video.source_id == entry.get('id'))
        )
        video = result.scalars().first()

        if not video:
            result = await db.execute(
                select(Uploader).filter(Uploader.channel_id == entry.get("channel_id"))
            )
            uploader = result.scalars().first()
            print("Adding a video to the playlist", entry.get("title"))

            if uploader:
                if uploader.source_id is None:
                    uploader.source_id = entry.get("uploader_id")
                    uploader.url = entry.get("uploader_url")
            else:
                # Create a new uploader if not found
                if entry.get("uploader") and entry.get("channel_id"):
                    uploader = Uploader(
                        source_id=entry.get("uploader_id"),
                        name=entry.get("uploader"),
                        url=entry.get("uploader_url"),
                        channel_id=entry.get("channel_id"),
                        channel_url=entry.get("channel_url") or f"https://www.youtube.com/channel/{entry.get('uploader_id')}"
                    )
                    db.add(uploader)
                    await db.flush()  # Flush to get the uploader ID
                    print("Created new uploader:", uploader.name)

                    print("Downloading uploader avatar...")
                    await download_uploader_avatar(uploader.id, db)

            await db.commit()  # Commit uploader creation

            # If the video is not in the database, create a new video
            video = Video(
                source_id=entry.get("id"),
                title=entry.get("title"),
                description=entry.get("description"),
                thumbnail=entry.get("thumbnail"),
                upload_date=entry.get("upload_date"),
                duration=entry.get("duration_string"),
                uploader_id=uploader.id if uploader else None,  # Link the uploader to the video
                available=entry.get("is_available", True),  # Set availability
            )
            db.add(video)
            await db.flush()
            print("Created new video:", video.title)
        else:
            # Update existing video info
            video.title = entry.get("title")
            video.description = entry.get("description")
            video.thumbnail = entry.get("thumbnail")
            video.upload_date = entry.get("upload_date")
            video.duration = entry.get("duration_string")
            if uploader:
                video.uploader_id = uploader.id
            video.available = entry.get("is_available", True)
            print("Updated existing video:", video.title)

        # Step 5: Create the relationship entry between Playlist and Video
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

    return playlist.title


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
            result_request = await db.execute(
                select(Playlist).filter(Playlist.source_id == playlist_id)
            )
            playlist = result_request.scalars().first()
            playlist_title = playlist.title if playlist else playlist_title
        except Exception as e:
            print(f"Error fetching playlist info: {e}")
            result = None

            # Remove playlist from db
            await db.execute(
                select(Playlist).filter(Playlist.source_id == playlist_id)
            )
            playlist = result_request.scalars().first()
            if playlist:
                await db.delete(playlist)
                await db.commit()
                print(f"Removed playlist {playlist_id} from database due to error.")

        finally:
            fetching.pop(playlist_id, None)
    
    if not result:
        print(f"Failed to fetch playlist info for {playlist_id}.")
        await ws_manager.send_message(
            "playlists", 
            {"playlist_id": playlist_id, "fetch_success": False, "message": f"Failed to fetch info for playlist : {playlist_title or playlist_id}" }
        )
    else:
        print(f"Fetched full playlist info for {playlist_id}.")

        await ws_manager.send_message(
            "playlists", 
            {"playlist_id": playlist_id, "fetch_success": True, "message": f"Successfully fetched info for playlist : {playlist_title or playlist_id}" }
        )
