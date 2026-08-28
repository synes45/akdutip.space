"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface ProgressItem {
  videoId: string;
  videoTitle: string;
  committeeTitle: string;
  currentTime: number;
  duration: number;
  updatedAt: string;
}

interface PlaylistItem {
  id: string;
  title: string;
  committeeTitle: string;
  duration: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"continue" | "playlist">("continue");
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState<ProgressItem[]>([]);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);

  useEffect(() => {
    async function loadProfileData() {
      try {
        // 1. Kullanıcı Oturum Bilgisini Çek
        const authRes = await fetch("/api/auth/me");
        let userData = null;
        if (authRes.ok) {
          const data = await authRes.json();
          userData = data.user;
          setUser(userData);
        }

        // 2. Ders Kataloğunu Çek (Video ID'lerini Başlık ve Komite Bilgisiyle Eşleştirmek İçin)
        const coursesRes = await fetch("/api/admin/courses");
        let committees = [];
        if (coursesRes.ok) {
          committees = await coursesRes.json();
        }

        // Videoları hızlı erişim için Harita (Map) yapısına getir
        const videoMap: Record<
          string,
          { title: string; committeeTitle: string; duration: number }
        > = {};

        if (Array.isArray(committees)) {
          committees.forEach((committee: any) => {
            committee.lessons?.forEach((subject: any) => {
              subject.videos?.forEach((v: any) => {
                videoMap[v.id] = {
                  title: v.title,
                  committeeTitle: committee.title,
                  duration: v.duration ? parseInt(v.duration) * 60 : 1200, // Varsayılan 20dk
                };
              });
            });
          });
        }

        // 3. LocalStorage Üzerinden Tüm İzleme Geçmişini Taramak
        const localHistory: ProgressItem[] = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("video_progress_")) {
            const videoId = key.replace("video_progress_", "");
            const currentTime = parseFloat(localStorage.getItem(key) || "0");

            if (currentTime > 0) {
              const videoMeta = videoMap[videoId];
              localHistory.push({
                videoId,
                videoTitle: videoMeta?.title || `Ders İçeriği (${videoId})`,
                committeeTitle: videoMeta?.committeeTitle || "Akdeniz Tıp Dersleri",
                currentTime,
                duration: videoMeta?.duration || 1200,
                updatedAt: "Son İzlenen",
              });
            }
          }
        }

        setHistory(localHistory);

        // 4. Oynatma Listesini Çek
        if (userData) {
          try {
            const playlistRes = await fetch("/api/user/playlist");
            if (playlistRes.ok) {
              const playlistData = await playlistRes.json();
              if (Array.isArray(playlistData)) {
                setPlaylist(playlistData);
              }
            }
          } catch (e) {
            console.error("Playlist çekilemedi:", e);
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
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold text-yellow-400">
        Profil Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="pt-28 max-w-[1200px] mx-auto px-6 pb-16 space-y-8">
          {/* PROFİL BAŞLIK VE KULLANICI KARTI */}
          <div className="bg-neutral-900/60 p-6 sm:p-8 rounded-3xl border border-neutral-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-yellow-500 to-amber-300 text-black font-black text-2xl sm:text-3xl rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                {user?.name ? user.name[0].toUpperCase() : "Ö"}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {user?.name || "Öğrenci Profili"}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  {user?.email || "öğrenci@akdeniz.edu.tr"}
                </p>
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs font-extrabold">
                  <span>🎓</span>
                  <span>Akdeniz Tıp Öğrencisi</span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB MENÜSÜ */}
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
            <button
              onClick={() => setActiveTab("continue")}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                activeTab === "continue"
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              ▶ Kaldığım Yerden Devam Et ({history.length})
            </button>
            <button
              onClick={() => setActiveTab("playlist")}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                activeTab === "playlist"
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              ⭐ Oynatma Listem ({playlist.length})
            </button>
          </div>

          {/* İÇERİK SEKSİYONLARI */}
          {activeTab === "continue" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🕒</span>
                <span>Son İzlediğin Dersler</span>
              </h2>

              {history.length === 0 ? (
                <div className="p-8 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800 text-neutral-500 text-sm">
                  Henüz izlenmiş bir ders bulunmuyor.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => {
                    const percent = Math.min(
                      100,
                      Math.round((item.currentTime / item.duration) * 100)
                    );

                    return (
                      <div
                        key={item.videoId}
                        className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-4"
                      >
                        <div>
                          <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">
                            {item.committeeTitle}
                          </span>
                          <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">
                            {item.videoTitle}
                          </h3>
                        </div>

                        {/* İlerleme Çubuğu */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                            <span>Kalan Saniye: {formatTime(item.currentTime)}</span>
                            <span>%{percent} Tamamlandı</span>
                          </div>
                          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] text-neutral-500">{item.updatedAt}</span>
                          <Link
                            href={`/ders/${item.videoId}`}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-yellow-500/10"
                          >
                            Devam Et →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "playlist" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📌</span>
                <span>Favori Ders Listem</span>
              </h2>

              {playlist.length === 0 ? (
                <div className="p-8 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800 text-neutral-500 text-sm">
                  Oynatma listenizde henüz video yok.
                </div>
              ) : (
                <div className="space-y-3">
                  {playlist.map((item) => (
                    <div
                      key={item.id}
                      className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between hover:bg-neutral-900 transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400">
                          {item.committeeTitle}
                        </span>
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-neutral-400">{item.duration}</span>
                        <Link
                          href={`/ders/${item.id}`}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition-all"
                        >
                          İzle
                        </Link>
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