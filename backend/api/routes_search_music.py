from fastapi import APIRouter, Query, HTTPException
from utils.youtube_search import (
    search_youtube, search_youtube_music,
    filter_by_channel_name, filter_music_by_channel_name,
    normalize_youtube_result, normalize_music_result
)

router = APIRouter()

@router.get("/search")
async def search(
    query: str = Query(..., description="Search text"),
    source: str = Query("youtube", enum=["youtube", "ytmusic"]),
    channel_name: str | None = Query(None, description="Optional fuzzy-matching filter"),
    type_filter: str = Query(
        "all",
        enum=["all", "song", "album", "artist", "video", "playlist", "channel"]
    )
):
    try:
        # ------------------- YOUTUBE -------------------
        if source == "youtube":
            results = await search_youtube(query)

            # Optional fuzzy channel filtering
            if channel_name:
                results = filter_by_channel_name(results, channel_name)

            normalized = [normalize_youtube_result(r) for r in results]

            # Type filtering
            if type_filter != "all":
                normalized = [
                    item for item in normalized
                    if item["type"] == type_filter
                ]

            return normalized

        # ------------------- YOUTUBE MUSIC -------------------
        if source == "ytmusic":
            results = await search_youtube_music(query)

            if channel_name:
                results = filter_music_by_channel_name(results, channel_name)

            normalized = [normalize_music_result(r) for r in results]

            # YTMusic resultType can be: "song", "video", "album", "artist", "playlist"
            if type_filter != "all":
                normalized = [
                    item for item in normalized
                    if item["type"] == type_filter
                ]

            return normalized

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
