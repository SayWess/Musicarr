"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { endpointPaths } from "@/constants/endpoints";
import errorToast from "@/components/toasts/errorToast";
import AddRootFolder from "@/components/settings/rootFolders/AddRootFolder";
import ListRootFolder from "@/components/settings/rootFolders/ListRootFolders";
import ExportIds from "@/components/settings/manage_items/export_ids";
import ImportIds from "@/components/settings/manage_items/import_data";

interface PathItem {
  path: string;
  default: boolean;
}

export default function Settings() {
  const [paths, setPaths] = useState<PathItem[]>([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    setLoading(true);
    fetchPaths();
    setLoading(false);
  }, []);

  async function fetchPaths() {
    try {
      const res = await axios.get<PathItem[]>(`${endpointPaths}/`);
      setPaths(res.data);
    } catch (error) {
      console.error("Error fetching paths:", error);
      errorToast("Failed to fetch paths. Please check the console for details.");
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-white">Settings</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="space-y-8">
          <ListRootFolder fetchPaths={fetchPaths} paths={paths} />

          <AddRootFolder onPathAdded={fetchPaths} />

          <ExportIds />

          <ImportIds />
        </div>
      )}
    </div>
  );
}
