from database.models import Uploader
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio
from database.database import SessionLocal

from sqlalchemy.future import select
from websocket_manager import ws_manager

downloading = {}


async def start_download_avatar(uploader: Uploader):
    """
    Démarre le téléchargement de l'avatar de l'uploader.

    Args:
        uploader (Uploader): L'uploader dont l'avatar doit être téléchargé.

    Returns:
        tuple: Un tuple contenant le succès du téléchargement et les erreurs éventuelles.
    """
    # Commande pour télécharger l'avatar
    command = [
        "yt-dlp",
        "--write-thumbnail",
        "--playlist-items",
        "0",
        "--skip-download",
        "-o",
        f"metadata/avatars/{uploader.id}.%(ext)s",
        f"https://www.youtube.com/channel/{uploader.channel_id}"
    ]

    print(f"Command to download avatar: {command}")

    # Exécution de la commande
    process = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    stdout, stderr = await process.communicate()

    print(f"yt-dlp output: {stdout.decode()}")
    print(f"yt-dlp error: {stderr.decode()}")

    if process.returncode == 0:
        return True, None
    else:
        return False, stderr.decode()



async def download_uploader_avatar(uploader_id: str, db: AsyncSession = None):
    """
    Démarre le téléchargement de l'avatar d'un uploader.

    Args:
        uploader_id (str): L'ID de l'uploader dont l'avatar doit être téléchargé.
        db (AsyncSession): La session de base de données.
    Returns:
        bool: True si le téléchargement a réussi, False sinon.
    """

    downloading[uploader_id] = True

    # Re-fetch the playlist with videos and PlaylistVideo relation
    result = await db.execute(
        select(Uploader)
        .where(Uploader.id == uploader_id)
    )
    uploader = result.scalar_one_or_none()

    if not uploader:
        print(f"Uploader with ID {uploader_id} not found.")
        return None

    print(f"Starting download avatar for uploader: {uploader.name}")

    # Download the uploader's avatar
    try:
        success, stderr = await start_download_avatar(uploader)
    except Exception as e:
        print(f"Error downloading avatar of {uploader.name}: {e}")
        success = None

    downloading.pop(uploader_id, None)

    return success


async def download_avatar(uploader: Uploader):

    downloading[uploader.id] = True

    # Download the uploader's avatar
    async with SessionLocal() as db:
        try:
            success = await download_uploader_avatar(uploader.id, db)
        except Exception as e:
            print(f"Error downloading avatar of {uploader.name}: {e}")
            success = None

    downloading.pop(uploader.id, None)

    if success:
        print(f"Avatar downloaded for uploader: {uploader.name}")
        await ws_manager.send_message(
            "uploaders", 
            {"uploader_id": str(uploader.id), "avatar_downloaded": True, "uploader_name": uploader.name}
        )
    else:
        print(f"Failed to download avatar for uploader: {uploader.name}")
        await ws_manager.send_message(
            "uploaders", 
            {"uploader_id":str(uploader.id), "avatar_downloaded": False, "uploader_name": uploader.name}
        )
