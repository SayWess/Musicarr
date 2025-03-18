"use client";
import Sidebar from "@/components/navigation/sidebar";
import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar /> {/* Sidebar Navigation, at bottom screen for mobile */}
      <main className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto">{children}</main>
    </div>
  );
}
