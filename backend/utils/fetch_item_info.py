import subprocess
import json
import asyncio


async def fetch_item_info(item_id):
    """
    Fetches information about a YouTube playlist or video using yt-dlp.
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
            item_id
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
            stderr = stderr.decode()
            print(f"yt-dlp error: {stderr}")
            if "Sign in" in stderr:
                item_info = json.loads(stdout.decode())
                return item_info
            
            return None

        item_info = json.loads(stdout.decode())
        return item_info
        
    except subprocess.CalledProcessError as e:
        print(f"Erreur d'exécution yt-dlp: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Erreur de décodage JSON: {e}")
        return None
