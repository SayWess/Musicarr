enum DownloadState {
  IDLE = "IDLE",
  DOWNLOADING = "DOWNLOADING",
  DOWNLOADED = "DOWNLOADED",
  ERROR = "ERROR",
}

interface Uploader {
  id: string;
  name: string;
  channel_url: string;
  channel_id?: string;
  channel_name?: string;
  channel_thumbnail?: string;
}

interface Playlist {
  id: string;
  title: string;
  folder: string;
  thumbnail: string;
  check_every_day: boolean;
  missing_videos: number;
  videos: Video[];
}

interface Video {
  id: string;
  title: string;
  downloaded: boolean;
  state: DownloadState;
}

interface PlaylistDetails {
  id: string;
  title: string;
  author: string;
  last_published: string;
  upload_date: string;
  folder: string;
  thumbnail: string;
  check_every_day: boolean;
  uploader: Uploader;
  videos: VideoDetails[];
}

interface VideoDetails {
  id: string;
  title: string;
  duration: string;
  quality?: string;
  thumbnail: string;
  downloaded: boolean;
  state: DownloadState;
  upload_date: string;
}

export type { Playlist, Video, PlaylistDetails, VideoDetails };
