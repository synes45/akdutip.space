"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

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

export default function DerslerPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [committees, setCommittees] = useState<{ id: string; title: string }[]>([]);
  const [lessons, setLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtreler
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommittee, setSelectedCommittee] = useState<string>("ALL");
  const [selectedLesson, setSelectedLesson] = useState<string>("ALL");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/courses");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const allComms: { id: string; title: string }[] = [];
            const allLess: Set<string> = new Set();
            const flattened: VideoItem[] = [];

            data.forEach((committee: any) => {
              allComms.push({ id: committee.id, title: committee.title });
              committee.lessons?.forEach((lesson: any) => {
                allLess.add(lesson.name);
                lesson.videos?.forEach((video: any) => {
                  flattened.push({
                    id: video.id,
                    title: video.title,
                    telegramId: video.telegramId,
                    pdfUrl: video.pdfUrl,
                    order: video.order,
                    lessonName: lesson.name,
                    committeeTitle: committee.title,
                    committeeId: committee.id,
                  });
                });
              });
            });

            setCommittees(allComms);
            setLessons(Array.from(allLess));
            setVideos(flattened);
          }
        }
      } catch (err) {
        console.error("Dersler yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.lessonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.committeeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.telegramId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCommittee =
        selectedCommittee === "ALL" || v.committeeId === selectedCommittee;

      const matchesLesson =
        selectedLesson === "ALL" || v.lessonName === selectedLesson;

      return matchesSearch && matchesCommittee && matchesLesson;
    });
  }, [videos, searchQuery, selectedCommittee, selectedLesson]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-yellow-500 selection:text-black flex flex-col justify-between">
      <div>
        <Header />

        <main className="pb-20 pt-28 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 space-y-8 relative z-30">
          {/* SAYFA BAŞLIĞI */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-yellow-500 uppercase tracking-widest">
                <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>DERS KATALOĞU</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Tüm Komite & Ders Arşivi
              </h1>
              <p className="text-sm text-neutral-400 max-w-xl">
                Aradığınız ders kaydını hızlıca bulun, filtreleyin ve hemen izlemeye başlayın.
              </p>
            </div>

            {/* ARAMA ÇUBUĞU */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ders veya konu ara..."
                className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-yellow-500 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
              />
              <svg className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* FİLTRELEME ALANI */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-4 rounded-2xl border border-neutral-900">
            {/* Komite Filtreleri */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
              <button
                onClick={() => setSelectedCommittee("ALL")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  selectedCommittee === "ALL"
                    ? "bg-yellow-500 text-black border-yellow-500 shadow-md shadow-yellow-500/15"
                    : "bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                Tüm Komiteler
              </button>
              {committees.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCommittee(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    selectedCommittee === c.id
                      ? "bg-yellow-500 text-black border-yellow-500 shadow-md shadow-yellow-500/15"
                      : "bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>

            {/* Branş Dropdown */}
            {lessons.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Branş:</span>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500 cursor-pointer"
                >
                  <option value="ALL">Tüm Branşlar</option>
                  {lessons.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* DERS LİSTESİ IZGARASI */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent" />
              <p className="text-xs font-bold text-neutral-400">Ders arşivi taranıyor...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="py-20 text-center bg-neutral-900/30 rounded-3xl border border-neutral-900 space-y-3">
              <svg className="w-12 h-12 text-neutral-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-base font-bold text-white">Eşleşen Ders Bulunamadı</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Arama teriminizi veya filtrelerinizi değiştirerek tekrar deneyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/ders/${video.id}`}
                  className="group bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-neutral-800/80 overflow-hidden hover:border-neutral-700 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-neutral-950 flex items-center justify-center overflow-hidden border-b border-neutral-800/50">
                    <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-yellow-950/10" />
                    
                    <svg className="w-10 h-10 text-neutral-800 group-hover:scale-105 group-hover:text-neutral-700 transition-all duration-300 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                      <div className="w-12 h-12 rounded-full bg-yellow-500 text-black flex items-center justify-center shadow-lg shadow-yellow-500/25 pl-1 transform scale-90 group-hover:scale-100 transition-all duration-300">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* PDF Rozeti */}
                    {video.pdfUrl && (
                      <span className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded border border-yellow-500/30 backdrop-blur-sm">
                        PDF
                      </span>
                    )}

                    {/* Telegram ID Rozeti */}
                    <span className="absolute bottom-2.5 right-2.5 z-20 px-2 py-0.5 bg-black/80 rounded-md text-[10px] font-mono font-bold text-yellow-400 border border-neutral-800">
                      #{video.telegramId}
                    </span>
                  </div>

                  {/* Detaylar */}
                  <div className="p-4.5 space-y-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                        {video.lessonName}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        {video.committeeTitle}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm lg:text-base line-clamp-2 leading-snug group-hover:text-yellow-400 transition-colors duration-300">
                      {video.title}
                    </h4>
                  </div>

                  {/* Alt Bar */}
                  <div className="px-4.5 py-3 bg-neutral-950/40 border-t border-neutral-800/40 flex items-center justify-between text-xs font-semibold text-neutral-400 group-hover:text-white transition-colors duration-300">
                    <span>Dersi Başlat</span>
                    <svg className="w-3.5 h-3.5 text-yellow-400 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
