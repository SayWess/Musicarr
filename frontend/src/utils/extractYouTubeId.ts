export const extractYouTubeId = (url: string) => {
    const videoMatch = url.match(/(?:v=|\/embed\/|\/v\/|\/vi\/|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
    const playlistMatch = url.match(/[?&]list=([A-Za-z0-9_-]+)/);
  
    if (playlistMatch) {
      return { type: "playlists", id: playlistMatch[1] };
    } else if (videoMatch) {
      return { type: "videos", id: videoMatch[1] };
    } else {
      return null;
    }
  };
  