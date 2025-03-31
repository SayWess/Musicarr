"use client";
import Sidebar from "@/components/navigation/sidebar";
import { ReactNode } from "react";
import { Toaster } from "sonner";


interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* Sidebar Navigation, at bottom screen for mobile */}
      <Toaster /> {/* Toast notifications */}
      <main className="flex-1 bg-gray-100 bg-gray-800 overflow-auto">{children}</main>
    </div>
  );
}
