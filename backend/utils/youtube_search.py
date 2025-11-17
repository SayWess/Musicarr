from googleapiclient.discovery import build
from dotenv import load_dotenv
from rapidfuzz import fuzz
from ytmusicapi import YTMusic
import os

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

YOUTUBE = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
YTMUSIC = YTMusic()   # works without auth for search


# ------------------------ YOUTUBE SEARCH ------------------------

async def search_youtube(query: str, max_results=20):
    req = YOUTUBE.search().list(
        q=query,
        part="snippet",
        type="video,playlist,channel",
        maxResults=max_results
    )
    res = req.execute()
    return res.get("items", [])


def filter_by_channel_name(results, channel_name: str):
    """Fuzzy match filtering by uploader/channel name."""
    filtered = []

    for item in results:
        snippet = item["snippet"]
        title = snippet.get("channelTitle", "")

        score = fuzz.partial_ratio(channel_name.lower(), title.lower())

        if score >= 90:  # threshold; adjust if needed
            filtered.append(item)

    return filtered


# ------------------------ YOUTUBE MUSIC SEARCH ------------------------

async def search_youtube_music(query: str, max_results=20):
    """YT Music search (songs, albums, videos depending on YTMusic result types)."""
    results = YTMUSIC.search(query)
    return results[:max_results]


def filter_music_by_channel_name(results, channel_name):
    filtered = []
    for item in results:
        artist = item.get("artist") or item.get("artists", [{}])[0].get("name", "")
        score = fuzz.partial_ratio(channel_name.lower(), artist.lower())
        if score >= 90:
            filtered.append(item)
    return filtered


# ------------------------ MAPPING RESULTS ------------------------

def normalize_youtube_result(item):
    kind = item["id"]["kind"]  # youtube#video, youtube#playlist, youtube#channel

    return {
        "type": "video" if kind == "youtube#video" else
                "playlist" if kind == "youtube#playlist" else
                "channel",
        "id": item["id"].get("videoId") or item["id"].get("playlistId") or item["id"].get("channelId"),
        "title": item["snippet"]["title"],
        "description": item["snippet"].get("description", ""),
        "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
        "channel": item["snippet"]["channelTitle"],
        "channel_id": item["snippet"]["channelId"]
    }


def normalize_music_result(item):
    return {
        "type": item.get("resultType"),  # song / video / album / artist / playlist
        "id": (
            item.get("videoId")
            or item.get("browseId")
            or item.get("playlistId")
            or item.get("channelId")
        ),
        "title": item.get("title"),
        "artist": item.get("artist") or item.get("artists", [{}])[0].get("name", ""),
        "thumbnail": item.get("thumbnails", [{}])[-1].get("url")
    }
