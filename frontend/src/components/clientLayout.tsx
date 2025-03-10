"use client";
import Sidebar from "@/components/navigation/sidebar";
import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-800">{children}</main>
    </div>
  );
}
