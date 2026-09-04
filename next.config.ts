import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Yanıtları gzip/brotli ile sıkıştır (varsayılan olarak kapalı gelir bazı versiyonlarda)
  compress: true,

  // Görseller için harici domain'lere izin ver
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.telegram.org",
      },
      {
        protocol: "https",
        hostname: "**.t.me",
      },
    ],
  },

  // Güvenlik ve performans header'ları
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
