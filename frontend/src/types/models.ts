enum DownloadState {
  IDLE = "IDLE",
  DOWNLOADING = "DOWNLOADING",
  DOWNLOADED = "DOWNLOADED",
  ERROR = "ERROR",
}

enum DownloadFormat {
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

enum DownloadQuality {
  q_best = "0",
  q_2160p = "2160",
  q_1440p = "1440",
  q_1080p = "1080",
  q_720p = "720",
  q_480p = "480",
  q_360p = "360",
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
  uploader_id?: string;
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
  download_path: string;
  thumbnail: string;
  check_every_day: boolean;
  default_format: DownloadFormat;
  default_quality: DownloadQuality;
  default_subtitles?: boolean;
  uploader: Uploader;
  videos: VideoDetails[];
}

interface VideoDetails {
  id: string;
  title: string;
  duration: string;
  quality?: DownloadQuality;
  format?: DownloadFormat;
  subtitles?: boolean;
  thumbnail: string;
  downloaded: boolean;
  state: DownloadState;
  upload_date: string;
  available: boolean;
}

interface GlobalPreferences {
  update_playlist_title: boolean
  update_playlist_uploader: boolean
  update_playlist_description: boolean
  update_playlist_thumbnai: boolean

  update_video_title: boolean
  update_video_uploader: boolean
  update_video_description: boolean
  update_video_thumbnail: boolean
}

export type { Playlist, Video, PlaylistDetails, VideoDetails, Uploader, GlobalPreferences};
export { DownloadState, DownloadFormat, DownloadQuality };
