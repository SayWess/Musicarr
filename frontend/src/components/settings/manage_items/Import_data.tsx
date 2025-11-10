"use client";

import UploadFile from "@/components/form/uploadFile";
import { endpointManageData } from "@/constants/endpoints";

export default function ImportIds() {

  return (
    <section>
      <h2 className="text-2xl font-semibold text-white mb-3">Import Data</h2>
      <UploadFile label="Upload Playlists and Videos IDs" apiUrl={endpointManageData + "/upload"} />
    </section>
  );
}
