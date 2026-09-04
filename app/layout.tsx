import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Akdeniz Tıp Ders Arşivi | MedStream",
  description: "Akdeniz Üniversitesi Tıp Fakültesi ders kayıtları, komite notları ve takvim arşivi.",
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
      <body className="min-h-full flex flex-col bg-neutral-950 text-white selection:bg-amber-500 selection:text-black">
        <div className="flex-1 flex flex-col min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}