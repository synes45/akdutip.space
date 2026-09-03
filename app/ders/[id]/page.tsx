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

interface Note {
  id: string;
  content: string;
  timestamp: number | null;
  createdAt: string;
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

  // Playlist ve Tamamlandı Durumu
  const [isInPlaylist, setIsInPlaylist] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Kişisel Ders Notları Durumları
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false);

  // Rapor Modal Durumları
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

  // 3. KALDIĞI YERİ, İLERLEMEYİ VE NOTLARI OKUMA
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

    // b) Sunucu senkronizasyonu (İlerleme)
    async function fetchSavedProgress() {
      try {
        const res = await fetch(`/api/user/progress?videoId=${video.id}`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data.currentTime === "number" && data.currentTime > 0) {
            setSavedTime(data.currentTime);
          }
          if (typeof data.isCompleted === "boolean") {
            setIsCompleted(data.isCompleted);
          }
        }
      } catch (err) {
        console.error("Kaldığı yer çekilemedi:", err);
      }
    }

    // c) Playlist Kontrolü
    async function fetchPlaylistStatus() {
      try {
        const res = await fetch(`/api/user/playlist?videoId=${video.id}`);
        if (res.ok) {
          const data = await res.json();
          setIsInPlaylist(!!data.inPlaylist);
        }
      } catch (err) {
        console.error("Playlist durumu çekilemedi:", err);
      }
    }

    // d) Derse Ait Notları Çekme
    async function fetchNotes() {
      try {
        const res = await fetch(`/api/user/notes?videoId=${video.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setNotes(data);
          }
        }
      } catch (err) {
        console.error("Notlar çekilemedi:", err);
      }
    }

    if (user) {
      fetchSavedProgress();
      fetchPlaylistStatus();
      fetchNotes();
    }
  }, [video?.id, user]);

  // 4. KALDIĞI YERİ KAYDETME
  const saveProgress = (time: number, forceCompleted?: boolean) => {
    if (!video || time <= 0) return;

    localStorage.setItem(`video_progress_${video.id}`, time.toString());

    if (user) {
      const currentDur = Math.floor(duration || videoRef.current?.duration || 0);
      const isComp = forceCompleted !== undefined ? forceCompleted : (currentDur > 0 && time >= currentDur * 0.9);

      fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.id,
          currentTime: Math.floor(time),
          duration: currentDur,
          isCompleted: isComp,
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

  // Zaman İlerlemesi Takibi & Otomatik Kayıt (Her 5 saniyede bir)
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (Math.floor(time) > 0 && Math.floor(time) % 5 === 0) {
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

  // Tamamlandı Olarak İşaretle / Kaldır
  const toggleCompleted = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const nextCompleted = !isCompleted;
    setIsCompleted(nextCompleted);
    saveProgress(currentTime || 1, nextCompleted);
  };

  // Yeni Not Ekle
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (!newNoteContent.trim()) return;

    setIsNoteSubmitting(true);
    try {
      const timestampVal = includeTimestamp ? Math.floor(currentTime) : null;
      const res = await fetch("/api/user/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.id,
          content: newNoteContent.trim(),
          timestamp: timestampVal,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [data.note, ...prev]);
        setNewNoteContent("");
      }
    } catch (err) {
      console.error("Not kaydedilemedi:", err);
    } finally {
      setIsNoteSubmitting(false);
    }
  };

  // Not Sil
  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/user/notes?id=${noteId}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (err) {
      console.error("Not silinemedi:", err);
    }
  };

  // Nota ait zamana atla
  const jumpToTime = (seconds: number | null) => {
    if (seconds !== null && videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      saveProgress(seconds);
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
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
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" />
          <p className="text-xs">Ders Yükleniyor...</p>
        </div>
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
          <Link href="/dersler" className="text-yellow-400 underline mt-4 inline-block">
            Ders Kataloğuna Dön
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-yellow-500 selection:text-black flex flex-col justify-between">
      <div>
        <Header />

        <main className="pt-28 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pb-16 space-y-6">
          
          {/* BREADCRUMB & DERS BİLGİ ALANI */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-900/40 p-3.5 rounded-2xl border border-neutral-800/60 backdrop-blur-md">
            <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-neutral-400">
              <Link
                href="/dersler"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-800 transition-all"
              >
                <span>←</span>
                <span>Katalog</span>
              </Link>

              <span className="text-neutral-600 font-bold">/</span>
              <span className="px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-bold">
                {currentItem.committeeTitle}
              </span>

              <span className="text-neutral-600 font-bold">/</span>
              <span className="px-3 py-1.5 rounded-xl bg-neutral-900 text-neutral-300 border border-neutral-800 font-bold">
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
                  className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded-xl transition-all shadow-md shadow-yellow-500/20 flex items-center gap-1.5 active:scale-95"
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
                <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
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
                    setIsCompleted(true);
                    saveProgress(duration, true);
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
                    className="absolute w-16 h-16 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md transition-transform hover:scale-110 active:scale-95 z-20 cursor-pointer"
                  >
                    <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}

                {/* ÖZEL KONTROL BARI */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4.5 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex flex-col gap-3 z-30">
                  
                  {/* İlerleme Çubuğu */}
                  <div className="relative w-full flex items-center group/slider">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-neutral-800 hover:h-2 rounded-lg appearance-none cursor-pointer accent-yellow-500 transition-all"
                    />
                  </div>

                  {/* Alt Kontrol Butonları */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:text-yellow-400 transition-colors cursor-pointer flex items-center justify-center"
                      >
                        {isPlaying ? (
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => skipTime(-10)}
                          className="text-[11px] font-bold text-neutral-400 hover:text-white px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                        >
                          -10s
                        </button>
                        <button
                          onClick={() => skipTime(10)}
                          className="text-[11px] font-bold text-neutral-400 hover:text-white px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                        >
                          +10s
                        </button>
                      </div>

                      {/* Ses */}
                      <div className="flex items-center gap-2 group/volume pl-2">
                        <button onClick={toggleMute} className="text-neutral-300 hover:text-white cursor-pointer flex items-center justify-center">
                          {isMuted || volume === 0 ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
                            </svg>
                          )}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
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
                          className="text-[11px] font-extrabold bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer"
                        >
                          ⚡ {playbackRate}x
                        </button>

                        {showSpeedMenu && (
                          <div className="absolute right-0 bottom-11 w-28 bg-neutral-950/95 backdrop-blur-xl border border-neutral-850 rounded-2xl p-1.5 shadow-2xl z-50 space-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                            <div className="text-[9px] font-black text-neutral-500 px-2.5 py-1.5 uppercase tracking-widest">
                              Hız Seçin
                            </div>
                            {speeds.map((rate) => (
                              <button
                                key={rate}
                                onClick={() => changeSpeed(rate)}
                                className={`w-full text-left text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                                  playbackRate === rate
                                    ? "bg-yellow-500 text-black"
                                    : "text-neutral-300 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <span>{rate}x</span>
                                {playbackRate === rate && (
                                  <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tam Ekran */}
                      <button
                        onClick={toggleFullscreen}
                        className="text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                        title="Tam Ekran (F)"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DERS BAŞLIĞI VE AKSİYON BUTONLARI */}
          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800/80 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-yellow-500 uppercase tracking-widest block">
                  {currentItem.committeeTitle}
                </span>
                {isCompleted && (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black rounded uppercase">
                    ✓ İzlendi
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{video.title}</h1>
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Ders Süresi: {duration ? formatTime(duration) : (video.duration || "Bilinmiyor")}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
              {/* TAMAMLANDI / İZLENDİ BUTONU */}
              <button
                onClick={toggleCompleted}
                className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 font-bold text-xs rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  isCompleted
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800/80"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{isCompleted ? "İzlendi Olarak İşaretli" : "İzlendi İşaretle"}</span>
              </button>

              {/* PLAYLIST / FAVORİLERE EKLE BUTONU */}
              <button
                onClick={togglePlaylist}
                className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 font-bold text-xs rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  isInPlaylist
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                    : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800/80"
                }`}
              >
                {isInPlaylist ? (
                  <svg className="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.77-.57-.372-1.81.588-1.81h4.908a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
                <span>{isInPlaylist ? "Listemde" : "Listeme Ekle"}</span>
              </button>

              {/* PDF DERS NOTU BUTONU */}
              <a
                href={video.pdfUrl || "#"}
                target={video.pdfUrl ? "_blank" : "_self"}
                rel="noreferrer"
                onClick={(e) => {
                  if (!video.pdfUrl) {
                    e.preventDefault();
                    alert("Bu derse ait PDF slaytı henüz yüklenmemiş.");
                  }
                }}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl border border-neutral-800/80 transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Ders Slaytı (PDF)</span>
              </a>

              {/* SORUN BİLDİR BUTONU */}
              <button
                onClick={() => setIsReportOpen(true)}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl border border-red-500/20 transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Sorun Bildir</span>
              </button>
            </div>
          </div>

          {/* 📝 ÖĞRENCİ DERS NOTLARI SEKSİYONU */}
          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800/80 backdrop-blur-md space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="text-base font-black text-white">Bu Derse Ait Notlarım ({notes.length})</h3>
              </div>
              <span className="text-[11px] text-neutral-400">
                Not aldığınız dakikaya tıklayarak videoda anında o ana geri dönebilirsiniz.
              </span>
            </div>

            {/* Not Ekleme Formu */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Önemli gördüğünüz bir tanım, hoca vurgusu veya komite sorusu notu ekleyin..."
                rows={2}
                className="w-full bg-neutral-950/80 border border-neutral-800 focus:border-yellow-500 rounded-2xl p-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTimestamp}
                    onChange={(e) => setIncludeTimestamp(e.target.checked)}
                    className="accent-yellow-500 rounded"
                  />
                  <span>Şu anki süreyi ({formatTime(currentTime)}) nota ekle</span>
                </label>

                <button
                  type="submit"
                  disabled={isNoteSubmitting || !newNoteContent.trim()}
                  className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-black text-xs rounded-xl transition-all shadow-md shadow-yellow-500/10 cursor-pointer active:scale-95"
                >
                  {isNoteSubmitting ? "Kaydediliyor..." : "Notu Kaydet"}
                </button>
              </div>
            </form>

            {/* Eklenmiş Notlar Listesi */}
            {notes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-3.5 space-y-2 relative group hover:border-neutral-700 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      {note.timestamp !== null ? (
                        <button
                          onClick={() => jumpToTime(note.timestamp)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-[10px] font-black hover:bg-yellow-500/20 transition-colors cursor-pointer"
                        >
                          <span>⏱ {formatTime(note.timestamp)}</span>
                          <span>▶</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-500">Genel Not</span>
                      )}

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-neutral-600 hover:text-red-400 transition-colors p-1 cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Notu Sil"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-xs text-neutral-200 font-normal leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Sorun Bildir Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 relative shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Videoda Sorun mu Var?</span>
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
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl hover:bg-neutral-700 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
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