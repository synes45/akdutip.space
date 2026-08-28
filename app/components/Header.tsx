"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Scroll Dinleyici
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Kullanıcı Oturum Kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Oturum kontrolü hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Çıkış Yap
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 outline-none select-none ${
          isScrolled
            ? "bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 py-3 shadow-lg shadow-black/40"
            : "bg-transparent border-b border-transparent py-5"
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          
          {/* Sol Logo */}
          <Link href="/" className="flex items-center gap-3 group outline-none">
            <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center font-black text-black text-lg shadow-md shadow-yellow-500/20 group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Akdeniz <span className="text-yellow-400">Tıp</span>
            </span>
          </Link>

          {/* Orta Navigasyon */}
          <nav className="hidden md:flex items-center gap-1.5 bg-neutral-900/80 backdrop-blur-md border border-neutral-800/80 px-2.5 py-1.5 rounded-full shadow-lg">
            <Link href="/" className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-neutral-800 transition-all">
              Ana Sayfa
            </Link>
            <Link href="#committees" className="px-4 py-1.5 rounded-full text-sm font-medium text-neutral-400 hover:text-white transition-all">
              Komiteler
            </Link>
            <Link href="/dersler" className="px-4 py-1.5 rounded-full text-sm font-medium text-neutral-400 hover:text-white transition-all">
              Ders Arşivi
            </Link>
            <Link href="/takvim" className="px-4 py-1.5 rounded-full text-sm font-medium text-neutral-400 hover:text-white transition-all">
              Takvim
            </Link>
          </nav>

          {/* Sağ Alan: Kullanıcı Durumu / Giriş & Çıkış */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-28 bg-neutral-900 animate-pulse rounded-full border border-neutral-800" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Admin Hızlı Erişim Rozeti */}
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                  >
                    Admin
                  </Link>
                )}

                {/* Kullanıcı Rozeti */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-semibold text-neutral-200 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-[130px] truncate">{user.name || user.email.split("@")[0]}</span>
                </div>

                {/* Çıkış Yap Butonu */}
                <button
                  onClick={handleLogout}
                  title="Çıkış Yap"
                  className="p-2 rounded-full bg-neutral-900/90 border border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              /* MODERN GİRİŞ YAP / KAYDOL BUTONU */
              <button
                onClick={() => setIsAuthOpen(true)}
                className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-black font-extrabold text-xs tracking-wide transition-all duration-300 shadow-md shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:scale-[1.02] active:scale-[0.97] border border-yellow-300/40 cursor-pointer overflow-hidden"
              >
                {/* Parıltı Efekti (Sheen) */}
                <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                <svg
                  className="w-3.5 h-3.5 text-black group-hover:rotate-12 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>

                <span>Giriş Yap / Kaydol</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser) => setUser(newUser)}
      />
    </>
  );
}