"use client";
import Sidebar from "@/components/navigation/sidebar";
import { ReactNode, useRef } from "react";
import { Toaster } from "sonner";
import { useGlobalWebSocket } from "@/hooks/useGlobalWebSocket";
import MusicSearchOverlay from "@/components/floating-options/Search";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const searchRef = useRef<{ openSearch: () => void }>(null);
  
  // Initializing WebSocket connection for playlists
  // This will allow us to listen for real-time updates related to playlists
  useGlobalWebSocket();
  return (
    <div className="flex h-screen">
      <Sidebar onSearchClick={() => {
          // Open the overlay when sidebar search button is clicked
          searchRef.current?.openSearch?.();
        }}/> {/* Sidebar Navigation, at bottom screen for mobile */}

      <Toaster /> {/* Toast notifications */}

      <MusicSearchOverlay ref={searchRef} />
      
      <main className="flex-1 bg-gray-100 bg-gray-800 overflow-auto">{children}</main>
    </div>
  );
}
