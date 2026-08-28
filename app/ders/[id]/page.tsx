"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AuthModal from "@/app/components/AuthModal";
import { Committee, Video } from "@/app/data/courses";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VideoPage({ params }: PageProps) {
  const { id } = use(params);

  // Oturum ve Kullanıcı Durumları
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Ders Verisi Durumları
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);

  // Player Durumları
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [savedTime, setSavedTime] = useState<number | null>(null);
  const [hasSeekedToSavedTime, setHasSeekedToSavedTime] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Playlist ve Favori Durumu
  const [isInPlaylist, setIsInPlaylist] = useState(false);

  // Modal Durumları
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportNote, setReportNote] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5];

  // 1. Kullanıcı Oturum Kontrolü
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Oturum kontrolü hatası:", err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Veritabanından komiteleri ve dersleri çekiyoruz
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/courses");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCommittees(data);
        }
      } catch (err) {
        console.error("Veriler yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Tüm videoları düzleştirilmiş şekilde listeleyelim
  const allVideos: {
    video: Video & { duration?: number; telegramId?: string };
    committeeTitle: string;
    subjectTitle: string;
  }[] = [];

  committees.forEach((committee: Committee) => {
    committee.lessons?.forEach((subject: any) => {
      subject.videos?.forEach((v: any) => {
        allVideos.push({
          video: v,
          committeeTitle: committee.title,
          subjectTitle: subject.name,
        });
      });
    });
  });

  const currentIndex = allVideos.findIndex((item) => item.video.id === id);
  const currentItem = allVideos[currentIndex] || allVideos[0];
  const video = currentItem?.video;

  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1].video : null;
  const nextVideo =
    currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1].video : null;

  // 3. KALDIĞI YERİ OKUMA (Önce LocalStorage, sonra API)
  useEffect(() => {
    if (!video) return;

    setHasSeekedToSavedTime(false);

    // a) LocalStorage kontrolü
    const localSaved = localStorage.getItem(`video_progress_${video.id}`);
    if (localSaved) {
      const parsedTime = parseFloat(localSaved);
      if (!isNaN(parsedTime) && parsedTime > 0) {
        setSavedTime(parsedTime);
      }
    }

    // b) Sunucu senkronizasyonu
    async function fetchSavedProgress() {
      try {
        const res = await fetch(`/api/user/progress?videoId=${video.id}`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data.currentTime === "number" && data.currentTime > 0) {
            setSavedTime(data.currentTime);
          }
        }
      } catch (err) {
        console.error("Kaldığı yer çekilemedi:", err);
      }
    }

    if (user) {
      fetchSavedProgress();
    }
  }, [video?.id, user]);

  // 4. KALDIĞI YERİ KAYDETME (Hem LocalStorage hem API)
  const saveProgress = (time: number) => {
    if (!video || time <= 0) return;

    // LocalStorage'a anında yaz
    localStorage.setItem(`video_progress_${video.id}`, time.toString());

    // Oturum açıksa API'ye arka planda gönder
    if (user) {
      fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.id,
          currentTime: Math.floor(time),
          duration: Math.floor(duration || videoRef.current?.duration || 0),
        }),
      }).catch((err) => console.error("API kaydetme hatası:", err));
    }
  };

  // Video hazır olduğunda veya savedTime yüklendiğinde süreyi ayarla
  const applySavedTime = () => {
    if (
      videoRef.current &&
      savedTime !== null &&
      savedTime > 0 &&
      !hasSeekedToSavedTime
    ) {
      videoRef.current.currentTime = savedTime;
      setCurrentTime(savedTime);
      setHasSeekedToSavedTime(true);
    }
  };

  // Sayfadan ayrılırken en son süreyi kaydet
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoRef.current) {
        saveProgress(videoRef.current.currentTime);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [video]);

  // Oynat / Durdur
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      saveProgress(videoRef.current.currentTime);
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Zaman İlerlemesi Takibi & Otomatik Kayıt (Her 3 saniyede bir)
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (Math.floor(time) > 0 && Math.floor(time) % 3 === 0) {
        saveProgress(time);
      }
    }
  };

  // İlerleme Çubuğu Tıklaması
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      saveProgress(time);
    }
  };

  // Playlist'e Ekle / Çıkar
  const togglePlaylist = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const action = isInPlaylist ? "remove" : "add";
      const res = await fetch("/api/user/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id, action }),
      });
      if (res.ok) {
        setIsInPlaylist(!isInPlaylist);
      }
    } catch (err) {
      console.error("Playlist güncellenemedi:", err);
    }
  };

  // Ses Seviyesi Değişimi
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  // Sesi Aç / Kapa
  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Hız Değiştirme
  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setShowSpeedMenu(false);
  };

  // İleri / Geri Sarma
  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      saveProgress(videoRef.current.currentTime);
    }
  };

  // Tam Ekran Kontrolü
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Saniye Formatlama (03:45)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Klavye Kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      )
        return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        skipTime(10);
      } else if (e.code === "ArrowLeft") {
        skipTime(-10);
      } else if (e.code === "KeyF") {
        toggleFullscreen();
      } else if (e.code === "KeyM") {
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isMuted]);

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video?.id, note: reportNote }),
      });
      setReportSent(true);
      setTimeout(() => {
        setReportSent(false);
        setIsReportOpen(false);
        setReportNote("");
      }, 2000);
    } catch (err) {
      console.error("Sorun bildirimi gönderilemedi:", err);
    } finally {
      setReportSubmitting(false);
    }
  };

  // Yüklenme Durumu
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold text-yellow-400">
        Yükleniyor...
      </div>
    );
  }

  // Video Bulunamadı Durumu
  if (!video) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
        <Header />
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-red-500">Video bulunamadı!</h1>
          <Link href="/" className="text-blue-400 underline mt-4 inline-block">
            Ana Sayfaya Dön
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-between">
      <div>
        <Header />

        <main className="pt-28 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pb-16 space-y-6">
          
          {/* BREADCRUMB & DERS BİLGİ ALANI */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-900/40 p-3.5 rounded-2xl border border-neutral-800/60 backdrop-blur-md">
            <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-neutral-400">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-800 transition-all"
              >
                <span>←</span>
                <span>Katalog</span>
              </Link>

              <span className="text-neutral-600 font-bold">/</span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-950/50 text-blue-400 border border-blue-800/40 font-bold">
                {currentItem.committeeTitle}
              </span>

              <span className="text-neutral-600 font-bold">/</span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-bold">
                {currentItem.subjectTitle}
              </span>

              <span className="text-neutral-600 font-bold hidden sm:inline">/</span>
              <span className="text-neutral-200 font-medium truncate max-w-[200px] sm:max-w-xs hidden sm:inline">
                {video.title}
              </span>
            </div>

            {/* Önceki / Sonraki Ders Butonları */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              {prevVideo ? (
                <Link
                  href={`/ders/${prevVideo.id}`}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl border border-neutral-800 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>←</span>
                  <span>Önceki Ders</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="px-3.5 py-1.5 bg-neutral-900/40 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-900/60 cursor-not-allowed"
                >
                  ← Önceki Ders
                </button>
              )}

              {nextVideo ? (
                <Link
                  href={`/ders/${nextVideo.id}`}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 active:scale-95"
                >
                  <span>Sonraki Ders</span>
                  <span>→</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="px-3.5 py-1.5 bg-neutral-900/40 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-900/60 cursor-not-allowed"
                >
                  Sonraki Ders →
                </button>
              )}
            </div>
          </div>

          {/* 🔴 ERİŞİM KONTROLÜ: GİRİŞ YAPILMAMIŞSA KİLİTLİ EKRAN */}
          {!user ? (
            <div className="relative aspect-video w-full rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center justify-center p-6 text-center shadow-2xl overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-yellow-500/5">
                🔒
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 max-w-lg">
                Bu İçerik Yalnızca Kayıtlı Öğrencilere Özeldir
              </h2>
              
              <p className="text-neutral-400 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
                Akdeniz Üniversitesi Tıp Fakültesi ders arşivine ve video içeriklerine erişmek için e-posta adresinizle giriş yapmanız gerekmektedir.
              </p>

              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-black font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Giriş Yap / Kaydol
              </button>
            </div>
          ) : (
            /* 🟢 GİRİŞ YAPILMIŞSA PLAYER KAPSAYICISI */
            <div
              ref={playerContainerRef}
              className="relative group bg-black rounded-2xl overflow-hidden border border-neutral-800/80 shadow-2xl select-none"
            >
              <div className="relative aspect-video w-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                      videoRef.current.playbackRate = playbackRate;
                      applySavedTime();
                    }
                  }}
                  onCanPlay={applySavedTime}
                  onEnded={() => {
                    setIsPlaying(false);
                    saveProgress(duration);
                  }}
                  onClick={togglePlay}
                  onContextMenu={(e) => e.preventDefault()}
                  src={(() => {
                    if (!video?.telegramId) return "";
                    if (video.telegramId.includes("/")) {
                      const parts = video.telegramId.split("/").filter(Boolean);
                      const msgId = parts[parts.length - 1];
                      const cId = parts[parts.length - 2];
                      return `/api/stream?chatId=${cId}&messageId=${msgId}`;
                    }
                    if (video.telegramId.includes(":")) {
                      const [cId, msgId] = video.telegramId.split(":");
                      return `/api/stream?chatId=${cId}&messageId=${msgId}`;
                    }
                    return `/api/stream?chatId=donem2dersmateryal&messageId=${video.telegramId}`;
                  })()}
                  className="w-full h-full object-contain cursor-pointer"
                />

                {/* Ortada Anlık Oynat/Durdur İkonu */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute w-16 h-16 bg-blue-600/90 hover:bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
                  >
                    ▶
                  </button>
                )}

                {/* ÖZEL KONTROL BARI */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex flex-col gap-2">
                  
                  {/* İlerleme Çubuğu */}
                  <div className="relative w-full flex items-center group/slider">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-neutral-800 hover:h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all"
                    />
                  </div>

                  {/* Alt Kontrol Butonları */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:text-blue-400 transition-colors text-lg"
                      >
                        {isPlaying ? "❚❚" : "▶"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => skipTime(-10)}
                          className="text-xs font-bold text-neutral-400 hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                        >
                          ⏮ -10s
                        </button>
                        <button
                          onClick={() => skipTime(10)}
                          className="text-xs font-bold text-neutral-400 hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                        >
                          +10s ⏭
                        </button>
                      </div>

                      {/* Ses */}
                      <div className="flex items-center gap-2 group/volume pl-2">
                        <button onClick={toggleMute} className="text-neutral-300 hover:text-white text-sm">
                          {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      <span className="text-xs font-mono text-neutral-300 pl-2">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Hız Menüsü */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="text-xs font-black bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-full transition-all active:scale-95"
                        >
                          ⚡ {playbackRate}x
                        </button>

                        {showSpeedMenu && (
                          <div className="absolute right-0 bottom-10 w-28 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-2xl p-1.5 shadow-2xl z-50 space-y-0.5">
                            <div className="text-[10px] font-bold text-neutral-400 px-2.5 py-1 uppercase tracking-wider">
                              Hız
                            </div>
                            {speeds.map((rate) => (
                              <button
                                key={rate}
                                onClick={() => changeSpeed(rate)}
                                className={`w-full text-left text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between ${
                                  playbackRate === rate
                                    ? "bg-blue-600 text-white"
                                    : "text-neutral-300 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                <span>{rate}x</span>
                                {playbackRate === rate && <span>✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tam Ekran */}
                      <button
                        onClick={toggleFullscreen}
                        className="text-neutral-300 hover:text-white text-base transition-colors"
                        title="Tam Ekran (F)"
                      >
                        {isFullscreen ? "↙" : "⛶"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ders Başlığı ve Aksiyonlar */}
          <div className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800/60 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1 max-w-2xl">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                {currentItem.committeeTitle}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{video.title}</h1>
              <p className="text-neutral-400 text-sm">Ders Süresi: {video.duration || "Bilinmiyor"}</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
              {/* PLAYLIST / FAVORİLERE EKLE BUTONU */}
              <button
                onClick={togglePlaylist}
                className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 font-bold text-xs rounded-xl border transition-all ${
                  isInPlaylist
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                    : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
                }`}
              >
                <span>{isInPlaylist ? "★" : "☆"}</span>
                <span>{isInPlaylist ? "Listemde" : "Listeme Ekle"}</span>
              </button>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Ders slaytı henüz yüklenmedi veya hazırlık aşamasında.");
                }}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl border border-neutral-700 transition-all"
              >
                <span>📄</span>
                <span>Ders Slaytı (PDF)</span>
              </a>

              <button
                onClick={() => setIsReportOpen(true)}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl border border-red-500/30 transition-all"
              >
                <span>⚠️</span>
                <span>Sorun Bildir</span>
              </button>
            </div>
          </div>

        </main>
      </div>

      {/* Sorun Bildir Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 relative shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>⚠️</span> Videoda Sorun mu Var?
            </h3>
            <p className="text-xs text-neutral-400">
              Ses cızırtısı veya eksik kısım varsa açıklayınız. Bildiriminiz admin paneline düşecektir.
            </p>

            {reportSent ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center">
                ✓ Bildiriminiz iletildi! Teşekkürler.
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <textarea
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Örn: 14. dakikadan sonra ses gidiyor..."
                  required
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl hover:bg-neutral-700"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    {reportSubmitting ? "Gönderiliyor..." : "Gönder"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal (Giriş Yapılmadığında Açılır) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser) => setUser(newUser)}
      />

      <Footer />
    </div>
  );
}