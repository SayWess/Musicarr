"use client";
import Sidebar from "@/components/navigation/sidebar";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { useGlobalWebSocket } from "@/hooks/useGlobalWebSocket";


interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Initializing WebSocket connection for playlists
  // This will allow us to listen for real-time updates related to playlists
  useGlobalWebSocket();

  return (
    <div className="flex h-screen">
      <Sidebar /> {/* Sidebar Navigation, at bottom screen for mobile */}
      <Toaster /> {/* Toast notifications */}
      <main className="flex-1 bg-gray-100 bg-gray-800 overflow-auto">{children}</main>
    </div>
  );
}
