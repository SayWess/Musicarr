import { cookies } from "next/headers";
import { endpointPlaylists } from "@/constants/endpoints";
import PlaylistClient from "@/components/playlists/PlaylistClient";
import axios from "axios";
import { VALID_SORT_FIELDS, VALID_ORDERS } from "@/constants/sortFields";

type SortField = (typeof VALID_SORT_FIELDS)[number];
type SortOrder = (typeof VALID_ORDERS)[number];

interface PlaylistPageParams {
  id: string;
}

export default async function PlaylistPage({ params }: { params: PlaylistPageParams }) {
  const cookieStore = await cookies();
  const params_ = await params;
  const { id } = params_;
  const sortBy = (cookieStore.get("sort_by")?.value || "upload_date") as SortField;
  const sortOrder = (cookieStore.get("order")?.value || "desc") as SortOrder;

  const res = await axios.get(
    `${endpointPlaylists}/${id}/details?sort_by=${sortBy}&order=${sortOrder}`
  );

  return (
    <PlaylistClient
      id={id}
      initialPlaylist={res.data}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
    />
  );
}
