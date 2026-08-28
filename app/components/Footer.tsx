"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-neutral-800/80 bg-neutral-950 py-16 overflow-hidden">
      
      {/* 1. Arka Plan Noktalı Grid Deseni (Dot Pattern) */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* 2. Sarı Parlama / Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-24 bg-yellow-500/5 blur-[100px] pointer-events-none rounded-full" />

      {/* 3. İçerik */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 relative z-10 flex flex-col items-center text-center space-y-8">
        
        {/* Logo & Marka */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center font-black text-black text-lg shadow-md shadow-yellow-500/20 group-hover:scale-105 transition-transform">
            A
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Akdeniz <span className="text-yellow-400">Tıp</span>
          </span>
        </Link>

        {/* Tanım */}
        <p className="text-xs sm:text-sm text-neutral-400 max-w-sm font-normal leading-relaxed">
          Akdeniz Üniversitesi Tıp Fakültesi öğrencileri için oluşturulmuş komite notları ve ders kayıtları arşivi.
        </p>

        {/* Ana Hızlı Menü */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-neutral-300">
          <a href="#committees" className="hover:text-yellow-400 transition-colors">
            Komiteler
          </a>
          <Link href="/dersler" className="hover:text-yellow-400 transition-colors">
            Tüm Dersler
          </Link>
          <Link href="/admin" className="hover:text-yellow-400 transition-colors">
            Admin Paneli
          </Link>
        </div>

        {/* 🛠️ Sayfa Boyu Uzayan Tam Genişlikte Çizgi */}
        <div className="w-full h-px bg-neutral-800/80" />

        {/* Alt Bilgi */}
        <div className="text-[11px] text-neutral-500 space-y-1">
          <p>© {currentYear} Akdeniz Tıp Arşivi. Tüm hakları saklıdır.</p>
        </div>

      </div>
    </footer>
  );
}