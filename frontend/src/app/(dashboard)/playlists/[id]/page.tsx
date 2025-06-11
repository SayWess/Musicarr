import { cookies } from "next/headers";
import { endpointPlaylists } from "@/constants/endpoints";
import PlaylistDetails from "@/components/playlists/PlaylistDetails";
import axios from "axios";
import { VALID_SORT_FIELDS_VIDEOS, SortOrder } from "@/constants/sortFields";
import { COOKIE_KEY_VIDEOS_ORDER, COOKIE_KEY_VIDEOS_SORT_BY } from "@/constants/cookies_keys";

type SortField = (typeof VALID_SORT_FIELDS_VIDEOS)[number];


interface PlaylistPageParams {
  id: string;
}

export default async function PlaylistPage({ params }: { params: Promise<PlaylistPageParams> }) {
  const cookieStore = await cookies();
  const { id } = await params;
  const sortBy = (cookieStore.get(COOKIE_KEY_VIDEOS_SORT_BY)?.value || "upload_date") as SortField;
  const sortOrder = (cookieStore.get(COOKIE_KEY_VIDEOS_ORDER)?.value || "desc") as SortOrder;

  const res = await axios.get(
    `${endpointPlaylists}/${id}/details?sort_by=${sortBy}&order=${sortOrder}`
  );

  return (
    <PlaylistDetails
      id={id}
      initialPlaylist={res.data}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
    />
  );
}
