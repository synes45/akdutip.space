"use client";

import React from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: "courses" | "calendar" | "members") => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    {
      id: "courses",
      label: "Ders & İçerik",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "calendar",
      label: "Takvim & Etkinlik",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "members",
      label: "Üyeler & Roller",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-full md:w-64 h-screen sticky top-0 bg-zinc-950/40 backdrop-blur-3xl border-r border-white/10 p-5 flex flex-col justify-between shrink-0 select-none overflow-hidden font-sans">
      
      {/* iOS Tarzı Arka Plan Işık Süzülmeleri (Glow Effects) */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-12 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-6 relative z-10">
        {/* Cam Dokulu Brand / Logo Alanı */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-[1px] shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-zinc-950/80 rounded-[11px] flex items-center justify-center font-bold text-amber-400 text-sm">
                M
              </div>
            </div>
            <div>
              <h1 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                MedStream
              </h1>
              <p className="text-[10px] text-amber-400/80 font-mono font-medium">SYSTEM PRO</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <p className="px-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold">
            Yönetim
          </p>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                type="button"
                className={`relative w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 active:scale-[0.97] cursor-pointer ${
                  isActive
                    ? "bg-white/[0.08] text-white border border-white/20 shadow-xl shadow-black/40 backdrop-blur-2xl"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 z-10">
                  <div
                    className={`p-1.5 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-amber-400 text-black shadow-md shadow-amber-400/30"
                        : "bg-white/5 text-zinc-400"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>

                {/* Aktif Buton İçin Parıltı / Glow İndikatörü */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] z-10" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* iOS Tarzı Alt Profil / Sistem Bilgisi Kartı */}
      <div className="relative z-10 pt-4 border-t border-white/10">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-[11px] font-medium text-zinc-300">VPS Online</span>
          </div>
          <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            v2.6
          </span>
        </div>
      </div>
    </aside>
  );
}