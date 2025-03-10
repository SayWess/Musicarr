import Image from "next/image";
import { Download, ListMusic, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Downloads", href: "/downloads", icon: <Download size={20} /> },
  { name: "Playlists", href: "/playlists", icon: <ListMusic size={20} /> },
  { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
];

export default function Sidebar() {
    const pathname = usePathname(); // Get current route

  return (
    <div className="h-screen w-60 bg-gray-900 text-white flex flex-col p-4 shadow-lg">
      <div className="flex justify-left items-center mb-6 ml-1">
        <Image src="/icon.webp" alt="Musicarr Logo" width={40} height={40} className="rounded-full overflow-hidden" />
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
           <Link key={item.href} href={item.href}>
           <div
             className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
               pathname === item.href ? "bg-blue-600" : "hover:bg-gray-700"
             }`}
           >
             {item.icon}
             <span>{item.name}</span>
           </div>
         </Link>
        ))}
      </nav>
    </div>
  );
}
