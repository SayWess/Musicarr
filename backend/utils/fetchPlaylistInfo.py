import subprocess
import json
from database.models import Playlist, Video, Uploader, PlaylistVideo  # Import your models
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import asyncio


async def fetch_playlist_info(playlist_url):
    """
    Récupère les informations d'une playlist et de ses vidéos associées via yt-dlp.

    Args:
        playlist_url (str): URL de la playlist YouTube.

    Returns:
        dict: Dictionnaire avec les informations de la playlist et des vidéos.
    """
    try:
        # Commande yt-dlp à exécuter dans le terminal
        command = [
            "yt-dlp", 
            # "--flat-playlist",  # Ne pas télécharger, juste lister les vidéos
            # "--skip-download",  # Ne pas télécharger les vidéos
            "-J",  # Sortie en JSON, dump toutes les infos
            "-i",
            # "--no-warnings",
            # "--ignore-no-formats-error",
            playlist_url
        ]
        # print("Command:", command)
        print("Starting yt-dlp command...")

        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            print(f"yt-dlp error: {stderr.decode()}")
            return None

        playlist_info = json.loads(stdout.decode())
        return playlist_info
        
    except subprocess.CalledProcessError as e:
        print(f"Erreur d'exécution yt-dlp: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Erreur de décodage JSON: {e}")
        return None


async def fetch_and_store_playlist_info(playlist_url, db: AsyncSession):
    """
    Fetches and stores playlist and videos to the database.

    Args:
        playlist_url (str): URL of the playlist.
        db_session (Session): SQLAlchemy session to interact with the database.
    
    Returns:
        bool: True if the playlist and videos were added successfully, else False.
    """
    # Step 1: Fetch playlist info using yt-dlp (can use your existing method)
    playlist_info = await fetch_playlist_info(playlist_url)
    if not playlist_info:
        print("Failed to fetch playlist info.")
        return False

    # Step 2: Check if the uploader exists or create a new uploader
    result = await db.execute(
        select(Uploader).filter(Uploader.channel_id == playlist_info.get("channel_id"))
    )
    uploader = result.scalars().first()  # Extract single result

    if not uploader:
        # Create a new uploader if not found
        uploader = Uploader(
            channel_id=playlist_info.get("channel_id"),
            name=playlist_info.get("uploader"),
            channel_url=playlist_info.get("channel_url") or f"https://www.youtube.com/channel/{playlist_info.get('channel_id')}"
        )
        db.add(uploader)
        await db.flush()
        print("Created new uploader:", uploader.name)
    
    await db.commit()  # Commit uploader creation

    # Step 3: Create the playlist entry
    result = await db.execute(
        select(Playlist).filter(Playlist.source_id == playlist_info.get("id"))
    )
    playlist = result.scalars().first()

    first_entry = playlist_info.get("entries", [])[0]  if playlist_info.get("entries") else {}

    if playlist:
       # Update existing playlist
        playlist.title = playlist_info.get("title")
        playlist.description = playlist_info.get("description")
        playlist.thumbnail = first_entry.get("thumbnail")
        playlist.last_published = first_entry.get("upload_date")
        playlist.uploader_id=uploader.id

        print("Updated existing playlist:", playlist.title)
    
    else:
        # Create new playlist if it doesn't exist
        playlist = Playlist(
            source_id=playlist_info.get("id"),
            title=playlist_info.get("title"),
            description=playlist_info.get("description"),
            thumbnail=first_entry.get("thumbnail"),
            uploader_id=uploader.id,
            last_published=first_entry.get("upload_date")
        )
        db.add(playlist)
        await db.flush() # Flush to get the playlist ID
        print("Created new playlist:", playlist.title)

    await db.commit()  # Commit playlist modification

    print("Playlist commited")

    # Step 4: Process each video in the playlist
    for entry in playlist_info.get("entries", []):
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
                uploader = Uploader(
                    source_id=entry.get("uploader_id"),
                    name=entry.get("uploader"),
                    url=entry.get("uploader_url"),
                    channel_id=entry.get("channel_id"),
                    channel_url=entry.get("channel_url") or f"https://www.youtube.com/channel/{entry.get('uploader_id')}"
                )
                db.add(uploader)
                print("Created new uploader:", uploader.name)
            await db.commit()  # Commit uploader creation

            # If the video is not in the database, create a new video
            video = Video(
                source_id=entry.get("id"),
                title=entry.get("title"),
                description=entry.get("description"),
                thumbnail=entry.get("thumbnail"),
                upload_date=entry.get("upload_date"),
                duration=entry.get("duration_string"),
                uploader_id=uploader.id  # Link the uploader to the video
            )
            db.add(video)
            await db.flush()
            print("Created new video:", video.title)

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

