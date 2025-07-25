export const extractYouTubeId = (
  url: string,
  desiredType: "Video" | "Playlist"
) => {
  const videoMatch = url.match(/(?:v=|\/embed\/|\/v\/|\/vi\/|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  const playlistMatch = url.match(/[?&]list=([A-Za-z0-9_-]+)/);

  if (desiredType === "Playlist" && playlistMatch) {
    return { type: "playlists", id: playlistMatch[1] };
  } else if (desiredType === "Video" && videoMatch) {
    return { type: "videos", id: videoMatch[1] };
  } else {
    return null;
  }
};

export function getItemUrl(itemUrl: string) {
  if (itemUrl.length !== 11) {
    return `https://www.youtube.com/playlist?list=${itemUrl}`;
  } else {
    return `https://www.youtube.com/watch?v=${itemUrl}`;
  }
}
