"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";

interface VideoItem {
  id: string;
  title: string;
  telegramId: string;
  pdfUrl?: string | null;
  order: number;
  lessonName: string;
  committeeTitle: string;
  committeeId: string;
}

interface Props {
  initialVideos: VideoItem[];
  initialCommittees: { id: string; title: string }[];
  initialLessons: string[];
}

export default function DerslerClient({ initialVideos, initialCommittees, initialLessons }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommittee, setSelectedCommittee] = useState<string>("ALL");
  const [selectedLesson, setSelectedLesson] = useState<string>("ALL");

  const filteredVideos = useMemo(() => {
    return initialVideos.filter((v) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.lessonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.committeeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.telegramId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCommittee = selectedCommittee === "ALL" || v.committeeId === selectedCommittee;
      const matchesLesson = selectedLesson === "ALL" || v.lessonName === selectedLesson;
      return matchesSearch && matchesCommittee && matchesLesson;
    });
  }, [initialVideos, searchQuery, selectedCommittee, selectedLesson]);

  return (
    <div className="min-h-screen min-h-svh bg-[#070709] text-white font-sans selection:bg-amber-400 selection:text-black flex flex-col justify-between relative overflow-x-hidden">
      {/* Glow Orbs — High performance radial gradient without GPU filter blur */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full opacity-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.15) 0%, rgba(168, 85, 247, 0.1) 40%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle at center, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
        }}
      />

      <div>
        <Header />

        <main className="pb-24 pt-32 max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10 relative z-10">

          {/* SAYFA BAŞLIĞI VE ARAMA */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-white/[0.06]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-medium text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Ders Kataloğu</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white/95">
                Tüm Komite &amp; Ders Arşivi
              </h1>
              <p className="text-sm text-neutral-400 font-normal max-w-xl">
                Aradığınız ders kaydını hızlıca bulun, filtreleyin ve hemen izlemeye başlayın.
              </p>
            </div>

            {/* ARAMA */}
            <div className="relative w-full lg:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ders veya konu ara..."
                className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-amber-400/60 rounded-2xl py-3 pl-10 pr-9 text-xs font-medium text-white placeholder-neutral-500 focus:outline-none transition-all duration-300"
              />
              <svg className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-white text-xs cursor-pointer transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* FİLTRELEME */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.02] p-3.5 px-4 rounded-3xl border border-white/[0.08]">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full scrollbar-none">
              <button
                onClick={() => setSelectedCommittee("ALL")}
                className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all duration-300 cursor-pointer whitespace-nowrap border active:scale-95 ${
                  selectedCommittee === "ALL"
                    ? "bg-amber-400 text-black border-amber-400 font-semibold shadow-lg shadow-amber-400/20"
                    : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                Tüm Komiteler
              </button>
              {initialCommittees.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCommittee(c.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all duration-300 cursor-pointer whitespace-nowrap border active:scale-95 ${
                    selectedCommittee === c.id
                      ? "bg-amber-400 text-black border-amber-400 font-semibold shadow-lg shadow-amber-400/20"
                      : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>

            {initialLessons.length > 0 && (
              <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
                <span className="text-xs font-medium text-neutral-400">Branş:</span>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="bg-black/40 border border-white/[0.08] text-neutral-200 text-xs font-medium rounded-2xl px-3.5 py-2 focus:outline-none focus:border-amber-400/60 cursor-pointer transition-colors"
                >
                  <option value="ALL" className="bg-neutral-900 text-white">Tüm Branşlar</option>
                  {initialLessons.map((l) => (
                    <option key={l} value={l} className="bg-neutral-900 text-white">{l}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* VİDEO LİSTESİ */}
          {filteredVideos.length === 0 ? (
            <div className="py-24 text-center bg-white/[0.015] rounded-3xl border border-white/[0.08] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-neutral-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-white/90">Eşleşen Ders Bulunamadı</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto font-normal">
                Arama teriminizi veya filtrelerinizi değiştirerek tekrar deneyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/ders/${video.id}`}
                  className="group bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden hover:border-white/20 hover:bg-white/[0.05] transition-colors cursor-pointer flex flex-col justify-between shadow-xl relative [content-visibility:auto] [contain-intrinsic-size:auto_280px]"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black/60 flex items-center justify-center overflow-hidden border-b border-white/[0.06]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-black via-neutral-950 to-amber-950/20" />
                    <svg className="w-10 h-10 text-neutral-600 group-hover:scale-110 group-hover:text-amber-400/80 transition-transform duration-300 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/30 pl-0.5 transform scale-90 group-hover:scale-100 transition-transform duration-200">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                    {video.pdfUrl && (
                      <span className="absolute top-3 left-3 z-20 px-2.5 py-0.5 bg-amber-400/10 text-amber-300 text-[10px] font-medium rounded-full border border-amber-400/20">PDF</span>
                    )}
                    <span className="absolute bottom-3 right-3 z-20 px-2.5 py-0.5 bg-black/60 rounded-full text-[10px] font-mono font-medium text-amber-300 border border-white/10">
                      #{video.telegramId}
                    </span>
                  </div>

                  {/* Detaylar */}
                  <div className="p-5 space-y-2.5 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium text-amber-400/90 uppercase tracking-wider">{video.lessonName}</span>
                      <span className="text-[10px] font-medium text-neutral-400 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">{video.committeeTitle}</span>
                    </div>
                    <h4 className="font-medium text-white/90 text-sm line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors duration-300">{video.title}</h4>
                  </div>

                  {/* Alt Bar */}
                  <div className="px-5 py-3.5 bg-white/[0.01] border-t border-white/[0.05] flex items-center justify-between text-xs font-medium text-neutral-400 group-hover:text-white transition-colors duration-300">
                    <span>Dersi Başlat</span>
                    <svg className="w-3.5 h-3.5 text-amber-400 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
