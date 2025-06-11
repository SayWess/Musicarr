import { cookies } from "next/headers";
import { endpointPlaylists } from "@/constants/endpoints";
import VideosDetails from "@/components/videos/VideosDetails";
import axios from "axios";
import { VALID_SORT_FIELDS_VIDEOS, SortOrder } from "@/constants/sortFields";
import { COOKIE_KEY_VIDEOS_SORT_BY, COOKIE_KEY_VIDEOS_ORDER } from "@/constants/cookies_keys";

type SortField = (typeof VALID_SORT_FIELDS_VIDEOS)[number];

export default async function VideosPage() {
  const cookieStore = await cookies();
  const id = "0";
  const sortBy = (cookieStore.get(COOKIE_KEY_VIDEOS_SORT_BY)?.value || "upload_date") as SortField;
  const sortOrder = (cookieStore.get(COOKIE_KEY_VIDEOS_ORDER)?.value || "desc") as SortOrder;

  const res = await axios.get(
    `${endpointPlaylists}/${id}/details?sort_by=${sortBy}&order=${sortOrder}`
  );

  return (
    <VideosDetails
      id={id}
      initialPlaylist={res.data}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
    />
  );
}
