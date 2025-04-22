import { cookies } from "next/headers";
import { endpointPlaylists } from "@/constants/endpoints";
import PlaylistDetails from "@/components/playlists/PlaylistDetails";
import axios from "axios";
import { VALID_SORT_FIELDS_VIDEOS, SortOrder } from "@/constants/sortFields";

type SortField = (typeof VALID_SORT_FIELDS_VIDEOS)[number];


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
    <PlaylistDetails
      id={id}
      initialPlaylist={res.data}
      initialSortBy={sortBy}
      initialSortOrder={sortOrder}
    />
  );
}
