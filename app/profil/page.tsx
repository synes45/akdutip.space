"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

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

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"continue" | "playlist" | "notes">("continue");
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState<ProgressItem[]>([]);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  useEffect(() => {
    async function loadProfileData() {
      try {
        // 1. Kullanıcı Oturum Bilgisini Çek
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          setUser(authData.user);
        }

        // 2. Gerçek Veritabanı İzleme Geçmişini Çek
        const progressRes = await fetch("/api/user/progress");
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          if (Array.isArray(progressData)) {
            setHistory(progressData);
          }
        }

        // 3. Oynatma Listesini Çek
        const playlistRes = await fetch("/api/user/playlist");
        if (playlistRes.ok) {
          const playlistData = await playlistRes.json();
          if (Array.isArray(playlistData)) {
            setPlaylist(playlistData);
          }
        }

        // 4. Öğrenci Notlarını Çek
        const notesRes = await fetch("/api/user/notes");
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          if (Array.isArray(notesData)) {
            setNotes(notesData);
          }
        }
      } catch (err) {
        console.error("Profil yüklenirken hata oluştu:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const calculateTotalWatchHours = () => {
    const totalSeconds = history.reduce((acc, curr) => acc + (curr.currentTime || 0), 0);
    const hours = (totalSeconds / 3600).toFixed(1);
    return hours;
  };

  const handleRemoveFromPlaylist = async (videoId: string) => {
    try {
      const res = await fetch("/api/user/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, action: "remove" }),
      });
      if (res.ok) {
        setPlaylist((prev) => prev.filter((item) => item.id !== videoId));
      }
    } catch (err) {
      console.error("Listeden çıkarılamadı:", err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/user/notes?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Not silinemedi:", err);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Tüm izleme geçmişinizi temizlemek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/user/progress", { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Geçmiş temizlenemedi:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold text-yellow-500">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent" />
          <p className="text-xs">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-yellow-500 selection:text-black flex flex-col justify-between">
      <div>
        <Header />

        <main className="pt-28 max-w-[1200px] mx-auto px-6 pb-20 space-y-8">
          
          {/* PROFİL BAŞLIK VE KULLANICI KARTI */}
          <div className="bg-neutral-900/40 p-6 sm:p-8 rounded-3xl border border-neutral-900 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-yellow-500 to-amber-400 text-black font-black text-2xl sm:text-3xl rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                {user?.name ? user.name[0].toUpperCase() : "Ö"}
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {user?.name || "Akdeniz Tıp Öğrencisi"}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400">
                  {user?.email || "ogrenci@ogr.akdeniz.edu.tr"}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs font-bold">
                  <span>🎓</span>
                  <span>Tıp Fakültesi Öğrencisi</span>
                </div>
              </div>
            </div>

            {/* İSTATİSTİK ROZETLERİ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
              <div className="bg-neutral-950 border border-neutral-900 p-3 rounded-2xl text-center">
                <span className="text-lg font-black text-yellow-500 block">{calculateTotalWatchHours()} saat</span>
                <span className="text-[10px] text-neutral-400 font-semibold">İzleme Süresi</span>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 p-3 rounded-2xl text-center">
                <span className="text-lg font-black text-emerald-400 block">{history.filter(h => h.isCompleted).length}</span>
                <span className="text-[10px] text-neutral-400 font-semibold">Tamamlanan</span>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 p-3 rounded-2xl text-center">
                <span className="text-lg font-black text-blue-400 block">{playlist.length}</span>
                <span className="text-[10px] text-neutral-400 font-semibold">Favori Ders</span>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 p-3 rounded-2xl text-center">
                <span className="text-lg font-black text-amber-300 block">{notes.length}</span>
                <span className="text-[10px] text-neutral-400 font-semibold">Kişisel Not</span>
              </div>
            </div>
          </div>

          {/* TAB MENÜSÜ */}
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("continue")}
                className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === "continue"
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/15"
                    : "bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                Kaldığım Yerden Devam Et ({history.length})
              </button>
              <button
                onClick={() => setActiveTab("playlist")}
                className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === "playlist"
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/15"
                    : "bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                Oynatma Listem ({playlist.length})
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === "notes"
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/15"
                    : "bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                Ders Notlarım ({notes.length})
              </button>
            </div>

            {activeTab === "continue" && history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer hidden sm:block"
              >
                Geçmişi Temizle
              </button>
            )}
          </div>

          {/* 1. SEKSİYON: KALDIĞIM YERDEN DEVAM ET */}
          {activeTab === "continue" && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="p-12 text-center bg-neutral-900/30 rounded-3xl border border-neutral-900 text-neutral-500 text-sm space-y-2">
                  <span className="text-3xl block">⏳</span>
                  <p className="font-semibold">Henüz izlenmiş bir ders kaydı bulunmuyor.</p>
                  <Link href="/dersler" className="text-xs text-yellow-500 hover:underline font-bold inline-block mt-2">
                    Ders Kataloğuna Göz At →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => (
                    <div
                      key={item.videoId}
                      className="bg-neutral-900/40 backdrop-blur-md p-5 rounded-2xl border border-neutral-900 hover:border-neutral-800 transition-all space-y-4 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-wider">
                              {item.lessonName}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-semibold">
                              • {item.committeeTitle}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">
                            {item.videoTitle}
                          </h3>
                        </div>
                        {item.isCompleted && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black rounded uppercase">
                            Tamamlandı
                          </span>
                        )}
                      </div>

                      {/* İlerleme Çubuğu */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-mono text-neutral-400 font-semibold">
                          <span>Kaldığı Yer: {formatTime(item.currentTime)}</span>
                          <span className="text-yellow-400">%{item.percent}</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                          <div
                            className={`h-full transition-all duration-300 ${
                              item.isCompleted
                                ? "bg-emerald-400"
                                : "bg-gradient-to-r from-yellow-500 to-amber-400"
                            }`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-neutral-500">{item.updatedAt}</span>
                        <Link
                          href={`/ders/${item.videoId}`}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl transition-all shadow-md shadow-yellow-500/10 active:scale-95"
                        >
                          İzlemeye Devam Et →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. SEKSİYON: OYNATMA LİSTEM */}
          {activeTab === "playlist" && (
            <div className="space-y-4">
              {playlist.length === 0 ? (
                <div className="p-12 text-center bg-neutral-900/30 rounded-3xl border border-neutral-900 text-neutral-500 text-sm space-y-2">
                  <span className="text-3xl block">⭐</span>
                  <p className="font-semibold">Oynatma listenizde henüz kayıtlı ders yok.</p>
                  <p className="text-xs text-neutral-600">
                    Ders izleme sayfasında <strong>"Listeme Ekle"</strong> butonuna basarak buraya ekleyebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {playlist.map((item) => (
                    <div
                      key={item.id}
                      className="bg-neutral-900/40 backdrop-blur-md p-4.5 rounded-2xl border border-neutral-900 flex items-center justify-between hover:bg-neutral-900/60 transition-all shadow-md"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest block">
                          {item.committeeTitle}
                        </span>
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleRemoveFromPlaylist(item.id)}
                          className="p-2 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Listeden Çıkar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <Link
                          href={`/ders/${item.id}`}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl border border-neutral-800 transition-all active:scale-95"
                        >
                          Dersi Aç
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. SEKSİYON: DERS NOTLARIM */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              {notes.length === 0 ? (
                <div className="p-12 text-center bg-neutral-900/30 rounded-3xl border border-neutral-900 text-neutral-500 text-sm space-y-2">
                  <span className="text-3xl block">📝</span>
                  <p className="font-semibold">Henüz ders notu kaydetmediniz.</p>
                  <p className="text-xs text-neutral-600">
                    Video oynatırken anlık not alabilir ve burada derli toplu görebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-neutral-900/40 backdrop-blur-md p-5 rounded-2xl border border-neutral-900 hover:border-neutral-800 transition-all space-y-3 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-neutral-850 pb-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
                            {note.lessonName} • {note.committeeTitle}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-1">{note.videoTitle}</h4>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-neutral-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          title="Notu Sil"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-xs text-neutral-300 font-normal leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-850 text-[10px] font-mono text-neutral-500">
                        <span>{note.createdAt}</span>
                        {note.timestamp !== null && (
                          <Link
                            href={`/ders/${note.videoId}`}
                            className="text-yellow-400 hover:underline font-bold flex items-center gap-1"
                          >
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