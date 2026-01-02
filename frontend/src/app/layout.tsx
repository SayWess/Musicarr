import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import {HeroUIProvider} from "@heroui/system";
import ClientLayout from "@/components/clientLayout";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Musicarr",
  description: "Manage your music library with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"antialiased"}>
        <HeroUIProvider>
          <ClientLayout> {children} </ClientLayout>
        </HeroUIProvider>
      </body>
    </html>
  );
}
