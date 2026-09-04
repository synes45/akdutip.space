"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";

interface ProgressItem {
  videoId: string;
  videoTitle: string;
  committeeTitle: string;
  lessonName: string;
  currentTime: number;
  duration: number;
  percent: number;
  isCompleted: boolean;
  updatedAt: string;
}

interface PlaylistItem {
  id: string;
  title: string;
  committeeTitle: string;
  duration: string;
}

interface NoteItem {
  id: string;
  videoId: string;
  content: string;
  timestamp: number | null;
  videoTitle: string;
  committeeTitle: string;
  lessonName: string;
  createdAt: string;
}

interface ProfileData {
  user: { name?: string; email?: string } | null;
  history: ProgressItem[];
  playlist: PlaylistItem[];
  notes: NoteItem[];
}

interface Props {
  initialData: ProfileData | null; // null = giriş yapılmamış
}

export default function ProfilClient({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState<"continue" | "playlist" | "notes">("continue");
  const [history, setHistory] = useState<ProgressItem[]>(initialData?.history ?? []);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(initialData?.playlist ?? []);
  const [notes, setNotes] = useState<NoteItem[]>(initialData?.notes ?? []);
  const user = initialData?.user ?? null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const calculateTotalWatchHours = () => {
    const total = history.reduce((acc, curr) => acc + (curr.currentTime || 0), 0);
    return (total / 3600).toFixed(1);
  };

  const handleRemoveFromPlaylist = async (videoId: string) => {
    try {
      const res = await fetch("/api/user/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, action: "remove" }),
      });
      if (res.ok) setPlaylist((prev) => prev.filter((item) => item.id !== videoId));
    } catch (err) {
      console.error("Listeden çıkarılamadı:", err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/user/notes?id=${id}`, { method: "DELETE" });
      if (res.ok) setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Not silinemedi:", err);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Tüm izleme geçmişinizi temizlemek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/user/progress", { method: "DELETE" });
      if (res.ok) setHistory([]);
    } catch (err) {
      console.error("Geçmiş temizlenemedi:", err);
    }
  };

  // Giriş yapılmamış
  if (!user) {
    return (
      <div className="min-h-screen min-h-svh bg-[#070709] text-white font-sans flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 px-4">
            <h2 className="text-xl font-semibold text-white">Profil için giriş yapmalısınız</h2>
            <p className="text-sm text-neutral-400">Ders geçmişinizi ve notlarınızı görmek için hesabınıza giriş yapın.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-svh bg-[#070709] text-white font-sans selection:bg-amber-400 selection:text-black flex flex-col justify-between relative overflow-x-hidden">
      {/* Glow Orbs — High performance radial gradient without GPU filter blur */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full opacity-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.15) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle at center, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
        }}
      />

      <div>
        <Header />
        <main className="pt-32 max-w-[1280px] mx-auto px-5 sm:px-8 pb-24 space-y-10 relative z-10">

          {/* PROFİL KART */}
          <div className="bg-white/[0.02] p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-amber-400 to-amber-200 text-black font-semibold text-2xl sm:text-3xl rounded-3xl flex items-center justify-center shadow-lg shadow-amber-400/20 shrink-0">
                {user.name ? user.name[0].toUpperCase() : "Ö"}
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-medium text-amber-300">
                  <span>🎓</span><span>Tıp Fakültesi Öğrencisi</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white/95">
                  {user.name || "Akdeniz Tıp Öğrencisi"}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 font-normal">
                  {user.email || "ogrenci@ogr.akdeniz.edu.tr"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              {[
                { val: `${calculateTotalWatchHours()}s`, label: "İzleme Süresi", color: "text-amber-300" },
                { val: history.filter((h) => h.isCompleted).length, label: "Tamamlanan", color: "text-emerald-400" },
                { val: playlist.length, label: "Favori Ders", color: "text-sky-400" },
                { val: notes.length, label: "Kişisel Not", color: "text-purple-400" },
              ].map(({ val, label, color }) => (
                <div key={label} className="bg-black/40 border border-white/[0.06] p-3.5 rounded-2xl text-center space-y-0.5">
                  <span className={`text-base font-semibold ${color} block`}>{val}</span>
                  <span className="text-[10px] text-neutral-400 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TAB BAR */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(["continue", "playlist", "notes"] as const).map((tab) => {
                const labels: Record<string, string> = {
                  continue: `Kaldığım Yerden Devam Et (${history.length})`,
                  playlist: `Oynatma Listem (${playlist.length})`,
                  notes: `Ders Notlarım (${notes.length})`,
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all duration-300 cursor-pointer whitespace-nowrap border active:scale-95 ${
                      activeTab === tab
                        ? "bg-amber-400 text-black border-amber-400 font-semibold shadow-lg shadow-amber-400/20"
                        : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
            {activeTab === "continue" && history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer hidden sm:block px-3 py-1.5 rounded-xl bg-rose-400/10 border border-rose-400/20"
              >
                Geçmişi Temizle
              </button>
            )}
          </div>

          {/* DEVAM ET */}
          {activeTab === "continue" && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="py-20 text-center bg-white/[0.015] rounded-3xl border border-white/[0.08] space-y-3">
                  <p className="text-xs text-neutral-400 font-normal">Henüz izlenmiş bir ders kaydı bulunmuyor.</p>
                  <Link href="/dersler" className="text-xs text-amber-300 hover:underline font-medium inline-block pt-1">
                    Ders Kataloğuna Göz At →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {history.map((item) => (
                    <div key={item.videoId} className="bg-white/[0.03] p-5 sm:p-6 rounded-3xl border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 space-y-4 shadow-xl relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">{item.lessonName}</span>
                            <span className="text-[10px] text-neutral-500 font-medium">• {item.committeeTitle}</span>
                          </div>
                          <h3 className="text-sm font-medium text-white/90 line-clamp-1">{item.videoTitle}</h3>
                        </div>
                        {item.isCompleted && (
                          <span className="px-2.5 py-0.5 bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 text-[9px] font-medium rounded-full uppercase">Tamamlandı</span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                          <span>Kaldığı Yer: {formatTime(item.currentTime)}</span>
                          <span className="text-amber-300">%{item.percent}</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/[0.05]">
                          <div
                            className={`h-full transition-all duration-500 ${item.isCompleted ? "bg-emerald-400" : "bg-gradient-to-r from-amber-400 to-amber-200"}`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-neutral-500">{item.updatedAt}</span>
                        <Link href={`/ders/${item.videoId}`} className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-2xl transition-all shadow-md shadow-amber-400/20 active:scale-95">
                          İzlemeye Devam Et →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OYNATMA LİSTESİ */}
          {activeTab === "playlist" && (
            <div className="space-y-4">
              {playlist.length === 0 ? (
                <div className="py-20 text-center bg-white/[0.015] rounded-3xl border border-white/[0.08] space-y-3">
                  <p className="text-xs text-neutral-400 font-normal">Oynatma listenizde henüz kayıtlı ders yok.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {playlist.map((item) => (
                    <div key={item.id} className="bg-white/[0.03] p-4 sm:p-5 rounded-3xl border border-white/[0.08] flex items-center justify-between hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 shadow-lg">
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider block">{item.committeeTitle}</span>
                        <h4 className="text-sm font-medium text-white/90">{item.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleRemoveFromPlaylist(item.id)} className="p-2 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer" title="Listeden Çıkar">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <Link href={`/ders/${item.id}`} className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium rounded-2xl border border-white/10 transition-all active:scale-95">
                          Dersi Aç
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTLAR */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              {notes.length === 0 ? (
                <div className="py-20 text-center bg-white/[0.015] rounded-3xl border border-white/[0.08] space-y-3">
                  <p className="text-xs text-neutral-400 font-normal">Henüz ders notu kaydetmediniz.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white/[0.03] p-5 sm:p-6 rounded-3xl border border-white/[0.08] hover:border-white/20 transition-all duration-300 space-y-3.5 shadow-xl">
                      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">{note.lessonName} • {note.committeeTitle}</span>
                          <h4 className="text-xs font-medium text-white/90 line-clamp-1">{note.videoTitle}</h4>
                        </div>
                        <button onClick={() => handleDeleteNote(note.id)} className="text-neutral-500 hover:text-rose-400 transition-colors p-1 cursor-pointer" title="Notu Sil">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-neutral-300 font-normal leading-relaxed whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[10px] font-mono text-neutral-500">
                        <span>{note.createdAt}</span>
                        {note.timestamp !== null && (
                          <Link href={`/ders/${note.videoId}`} className="text-amber-300 hover:underline font-medium flex items-center gap-1.5">
                            <span>⏱ {formatTime(note.timestamp)}</span>
                            <span>→</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
