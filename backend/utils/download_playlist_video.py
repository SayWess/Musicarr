import asyncio
import re
from database.models import Video, Playlist, DownloadFormat, DownloadQuality
from websocket_manager import ws_manager


def get_output_path(playlist: Playlist):
    return f"downloads/%(uploader)s/{playlist.title}/%(title)s.%(ext)s"


async def start_download_video(playlist: Playlist, video: Video):
    try:
        command = [
            "yt-dlp",
            "--progress",
            "--newline",
            "--no-playlist",  # just in case
            "--embed-thumbnail",
            "-o", get_output_path(playlist),
            video.source_id
        ]

        if playlist.default_format == DownloadFormat.AUDIO:
            command.append("-x")
        else:
            quality = playlist.default_quality.value
            if quality == 0: # Best quality
                command.extend(["-f", "bestvideo+bestaudio/best"])
            else:
                command.extend([
                    "-f", f"bestvideo[height<={quality}]+bestaudio/best[height<={quality}]"
                ])

        if playlist.default_subtitles:
            command.extend(["--write-sub", "--sub-lang", "en", "--convert-subs", "srt"])

        print("Command:", command)
        print("Starting yt-dlp command...")

        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        last_percentage = 0
        stage = -1
        STAGE_NAMES = ["video", "audio", "thumbnail"] if playlist.default_format == DownloadFormat.VIDEO else ["audio", "thumbnail"]

        async for line in process.stdout:
            line = line.decode("utf-8").strip()
            print(line)

            if "[download] Destination" in line:
                stage += 1
            match = re.search(r"\[download\]\s+([\d.]+)%", line)
            if match:
                percent = float(match.group(1))
                stage_name = STAGE_NAMES[stage] if stage < len(STAGE_NAMES) else f"{stage}: "

                # Only send update if a significant change occurred
                if abs(percent - last_percentage) >= 5 or percent == 100:
                    
                    await ws_manager.send_message("playlists", {
                        "playlist_id": playlist.source_id,
                        "video_id": video.source_id,
                        "video_title": video.title,
                        "progress": percent,
                        "status": "downloading",
                        "download_stage": stage_name
                    })
                    
                    last_percentage = percent



        returncode = await process.wait()
        stderr = await process.stderr.read()
        print(returncode, stderr.decode())
        return returncode != 0, stderr

    except Exception as e:
        return 1, str(e)
