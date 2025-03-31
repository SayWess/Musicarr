"use client";

import Image from "next/image";
import { Download, ListMusic, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { name: "Downloads", href: "/downloads", icon: <Download size={20} /> },
  { name: "Playlists", href: "/playlists", icon: <ListMusic size={20} /> },
  { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Adjusts highlighting for playlist detail pages
  const isActive = (href: string) => {
    if (href === "/playlists") return pathname.startsWith("/playlists");
    return pathname === href;
  };

  return (
    <div className="bg-gray-900 text-white shadow-lg transition-all duration-300">
      {/* Desktop Layout */}
      <div className={`hidden md:flex md:flex-col md:min-h-screen bg-gray-900 text-white shadow-lg transition-all duration-300 ${`${collapsed ? "md:w-20" : "md:w-60"} flex flex-col p-4`}`}>
        <div className="flex items-center justify-between mb-6">
          <Image src="/icon.webp" alt="Musicarr Logo" width={40} height={40} className="rounded-full" />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition"
          >
            {collapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>

        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className={`flex items-center p-3 rounded-lg ${
                  collapsed ? "justify-center" : "space-x-3"
                } cursor-pointer transition-colors ${
                  isActive(item.href) ? "bg-blue-600" : "hover:bg-gray-700"
                }`}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Layout */}
      <nav className="md:hidden flex justify-around w-full fixed bottom-0 left-0 right-0 z-50 bg-gray-900">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex-1">
            <div
              className={`flex items-center justify-center p-2 cursor-pointer transition-colors ${
                isActive(item.href) ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              {item.icon}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
