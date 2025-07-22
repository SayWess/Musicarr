from googleapiclient.discovery import build
import os
from dotenv import load_dotenv
import re

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

async def get_playlist_info(playlist_id):
    playlist_request = YOUTUBE.playlists().list(
        part="snippet",
        id=playlist_id
    )
    playlist_response = playlist_request.execute()
    if not playlist_response["items"]:
        return None
    return playlist_response["items"][0]

async def get_playlist_items(playlist_id):
    videos = []
    next_page_token = None

    while True:
        playlist_items_request = YOUTUBE.playlistItems().list(
            part="snippet,contentDetails",
            playlistId=playlist_id,
            maxResults=50,
            pageToken=next_page_token
        )
        playlist_items_response = playlist_items_request.execute()
        for item in playlist_items_response["items"]:
            videos.append(item)
        next_page_token = playlist_items_response.get("nextPageToken")
        if not next_page_token:
            break

    return videos

def chunked(lst, n):
    """Découpe une liste en morceaux de taille n."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

async def get_video_details(video_ids):
    result = {}

    for chunk in chunked(video_ids, 50):
        video_request = YOUTUBE.videos().list(
            part="snippet,contentDetails",
            id=",".join(chunk)
        )
        response = video_request.execute()
        for item in response.get("items", []):
            result[item["id"]] = item

    return result

def get_best_thumbnail(snippet: dict) -> str | None:
    thumbnails = snippet.get("thumbnails", {})
    return (
        thumbnails.get("maxres", {}).get("url")
        or thumbnails.get("standard", {}).get("url")
        or thumbnails.get("high", {}).get("url")
        or thumbnails.get("medium", {}).get("url")
        or thumbnails.get("default", {}).get("url")
    )


def parse_duration(duration: str) -> str:
    """
    Convertit une durée ISO 8601 (ex: 'PT1H2M3S') en format compact (ex: '2:51' ou '1:03:20').
    """
    pattern = re.compile(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?")
    match = pattern.fullmatch(duration)
    if not match:
        return "0:00"

    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)

    if hours > 0:
        return f"{hours}:{minutes:02}:{seconds:02}"
    else:
        return f"{minutes}:{seconds:02}"


async def fetch_video_info_from_api(video_id: str) -> dict | None:
    try:
        response = YOUTUBE.videos().list(
            part="snippet,contentDetails",
            id=video_id
        ).execute()
    except Exception as e:
        print(f"API error: {e}")
        return None

    if not response["items"]:
        return None

    video = response["items"][0]
    snippet = video["snippet"]
    content = video["contentDetails"]

    return {
        "id": video_id,
        "title": snippet["title"],
        "description": snippet.get("description", ""),
        "thumbnail": get_best_thumbnail(snippet),
        "upload_date": snippet["publishedAt"].split("T")[0].replace("-", ""),
        "duration_string": parse_duration(content["duration"]),
        "channel_id": snippet["channelId"],
        "uploader": snippet.get("channelTitle"),
        "channel_url": f"https://www.youtube.com/channel/{snippet['channelId']}",
        "uploader_id": snippet["channelId"],
        "uploader_url": f"https://www.youtube.com/channel/{snippet['channelId']}",
    }
