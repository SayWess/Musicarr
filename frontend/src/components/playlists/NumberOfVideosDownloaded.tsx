import React from "react";
import useSWR from "swr";
import { endpointPlaylists } from "@/constants/endpoints";
import { Download } from "lucide-react";
import { fetcher } from "@/utils/fetcher";


const NumberOfVideosDownloaded = ({ playlist_id }: { playlist_id: string }) => {
  const { data: data, isLoading } = useSWR(
    `${endpointPlaylists}/${playlist_id}/number_of_videos_downloaded`,
    fetcher
  );

  return (
    <div className="flex items-center gap-2">
      <Download size={16} />
      Videos:{" "}
      <span>
        {!isLoading && data
          ? `${data.downloaded_videos} / ${data.total_videos}`
          : "Loading..."}
      </span>
    </div>
  );
};

export default NumberOfVideosDownloaded;
