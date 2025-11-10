"use client";

import { endpointManageData } from "@/constants/endpoints";
import { Download } from "lucide-react";

export default function ExportIds() {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-white mb-3">Export Data</h2>
      <a
        href={endpointManageData + "/export"}
        download
        className="text-sm text-blue-400 hover:underline hover:border-blue-600 flex items-center gap-1 rounded-lg border-2 px-3 py-2 text-sm transition w-fit"
      >
        <Download size={16} />
        Download Playlists and Videos ids
      </a>
    </section>
  );
}
