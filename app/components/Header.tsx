"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";

interface UserType {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ease-in-out select-none ${
          isScrolled
            ? "bg-zinc-950/40 backdrop-blur-xl border-b border-white/5 py-3 shadow-sm"
            : "bg-transparent border-b border-transparent py-4"
        }`}
      >
        <div className="w-full px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group outline-none">
              <span className="text-lg font-bold tracking-tight text-zinc-100 uppercase group-hover:text-amber-400 transition-colors">
                AKDENİZ <span className="text-zinc-400 font-normal">TIP</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-zinc-100 hover:text-white transition-colors">Ana Sayfa</Link>
              <Link href="#committees" className="text-zinc-400 hover:text-zinc-200 transition-colors">Komiteler</Link>
              <Link href="/dersler" className="text-zinc-400 hover:text-zinc-200 transition-colors">Ders Arşivi</Link>
              <Link href="/takvim" className="text-zinc-400 hover:text-zinc-200 transition-colors">Takvim</Link>
              <Link href="/akis" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Akış Modu
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button aria-label="Bildirimler" className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-full hidden sm:flex transition cursor-pointer backdrop-blur-sm">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {loading ? (
              <div className="h-9 w-24 bg-zinc-900/60 animate-pulse rounded-full border border-zinc-800/80" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
                    Admin
                  </Link>
                )}
                <Link href="/profil" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-[110px] truncate">{user.name || user.email.split("@")[0]}</span>
                </Link>
                <button onClick={handleLogout} title="Çıkış Yap" className="p-2 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer backdrop-blur-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 text-xs font-medium hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer backdrop-blur-sm">
                Giriş Yap
              </button>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 md:hidden rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 hover:text-white transition-all cursor-pointer backdrop-blur-sm" aria-label="Menüyü Aç">
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobil Menü */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-20 right-4 left-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-1">
              <Link href="/" className="px-4 py-2.5 rounded-xl hover:bg-zinc-900 text-sm font-semibold text-zinc-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Ana Sayfa</Link>
              <Link href="#committees" className="px-4 py-2.5 rounded-xl hover:bg-zinc-900 text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Komiteler</Link>
              <Link href="/dersler" className="px-4 py-2.5 rounded-xl hover:bg-zinc-900 text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Ders Arşivi</Link>
              <Link href="/takvim" className="px-4 py-2.5 rounded-xl hover:bg-zinc-900 text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Takvim</Link>
              <Link href="/akis" className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm font-semibold text-amber-400 transition-colors flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                <span>Akış Modu</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={(newUser) => setUser(newUser)} />
    </>
  );
}