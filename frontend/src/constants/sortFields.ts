export const VALID_SORT_FIELDS_VIDEOS = ["title", "upload_date", "state"] as const;
export const VALID_SORT_FIELDS_PLAYLISTS = ["title", "last_published", "created_at", "state", "videos_count", "downloaded_count", "missing_count", "uploader"] as const;
const VALID_ORDERS = ["asc", "desc"] as const;


export type SortField = (typeof VALID_SORT_FIELDS_PLAYLISTS | typeof VALID_SORT_FIELDS_VIDEOS)[number];
export type SortOrder = (typeof VALID_ORDERS)[number];
