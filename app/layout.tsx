// app/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/app/components/Loader";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-white selection:bg-blue-600 selection:text-white">
        {/* Loader artık içeriği gizlemiyor, sadece en üstte bağımsız çalışıyor */}
        {loading && (
          <div className="fixed inset-0 z-[999] bg-neutral-950 flex items-center justify-center pointer-events-auto">
            <Loader text="Yükleniyor..." />
          </div>
        )}
        <div className="flex-1 flex flex-col min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}