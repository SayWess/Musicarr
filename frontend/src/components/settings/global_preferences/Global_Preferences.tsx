"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import errorToast from "@/components/toasts/errorToast";
import successToast from "@/components/toasts/successToast";
import { endpointGlobalPreferences } from "@/constants/endpoints";
import { GlobalPreferences as GlobalPreferencesInterface } from "@/types/models";
import { Loader2 } from "lucide-react";

export default function GlobalPreferences() {
  const [prefs, setPrefs] = useState<GlobalPreferencesInterface>();
  const [loading, setLoading] = useState(true);

  async function fetchGlobalPreferences() {
    try {
      const res = await axios.get<GlobalPreferencesInterface>(`${endpointGlobalPreferences}/`);
      setPrefs(res.data);
    } catch (error) {
      console.error("Error fetching global preferences:", error);
      errorToast("Failed to fetch global preferences.");
    }
  }

  async function updateGlobalPreferences(updated: Partial<GlobalPreferencesInterface>) {
    try {
      console.log(updated)
      await axios.post(`${endpointGlobalPreferences}`, updated);
      successToast("Preferences updated!");
      setPrefs((prev) => ({ ...prev!, ...updated }));
    } catch (error) {
      console.error("Error updating global preferences:", error);
      errorToast("Failed to update global preferences.");
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchGlobalPreferences();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!prefs) return <h2> Error loading preferences </h2>

  // Split preferences by playlist/video automatically
  const playlistPrefs = Object.entries(prefs).filter(([key]) => key.startsWith("update_playlist"));
  const videoPrefs = Object.entries(prefs).filter(([key]) => key.startsWith("update_video"));

  const renderPref = (key: string, value: boolean) => (
    <div key={key} className="flex items-center justify-between">
      <span className="text-white text-lg">{key.replace(/update_|_/g, " ")}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => updateGlobalPreferences({ [key]: e.target.checked })}
        className="h-5 w-5 rounded border-gray-300 accent-blue-500"
      />
    </div>
  );

  return (
    <section>
      <h1 className="text-3xl font-bold text-white mb-8 text-start">Global Preferences</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Playlist Preferences */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-white mb-4">Playlist Update Preferences</h2>
          <div className="flex flex-col gap-4">
            {playlistPrefs.map(([key, value]) => renderPref(key, value))}
          </div>
        </div>

        {/* Video Preferences */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-white mb-4">Video Update Preferences</h2>
          <div className="flex flex-col gap-4">
            {videoPrefs.map(([key, value]) => renderPref(key, value))}
          </div>
        </div>
      </div>
    </section>
  );
}
