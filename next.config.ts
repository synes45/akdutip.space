import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.telesco.pe" },
      { protocol: "https", hostname: "t.me" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.evrimagaci.org" },
      { protocol: "https", hostname: "**.tubitak.gov.tr" },
      { protocol: "https", hostname: "**.medicana.com.tr" },
      { protocol: "https", hostname: "**.alfatip.com.tr" },
    ],
  },
};

export default nextConfig;
