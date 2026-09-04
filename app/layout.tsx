// app/layout.tsx — Server Component (use client kaldırıldı)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientShell from "@/app/components/ClientShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Akdeniz Tıp | Ders Arşivi",
  description: "Akdeniz Üniversitesi Tıp Fakültesi ders arşivi ve video platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-white selection:bg-blue-600 selection:text-white">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}