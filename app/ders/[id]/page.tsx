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

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);

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

  const [isInPlaylist, setIsInPlaylist] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportNote, setReportNote] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5];

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

  useEffect(() => {
    if (!video) return;

    setHasSeekedToSavedTime(false);

    const localSaved = localStorage.getItem(`video_progress_${video.id}`);
    if (localSaved) {
      const parsedTime = parseFloat(localSaved);
      if (!isNaN(parsedTime) && parsedTime > 0) {
        setSavedTime(parsedTime);
      }
    }

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (Math.floor(time) > 0 && Math.floor(time) % 5 === 0) {
        saveProgress(time);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      saveProgress(time);
    }
  };

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

  const toggleCompleted = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const nextCompleted = !isCompleted;
    setIsCompleted(nextCompleted);
    saveProgress(currentTime || 1, nextCompleted);
  };

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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

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

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setShowSpeedMenu(false);
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      saveProgress(videoRef.current.currentTime);
    }
  };

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

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center font-bold text-amber-400">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" />
          <p className="text-xs">Ders Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
        <Header />
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-rose-500">Video bulunamadı!</h1>
          <Link href="/dersler" className="text-amber-400 underline mt-4 inline-block">
            Ders Kataloğuna Dön
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans selection:bg-amber-400 selection:text-black flex flex-col justify-between relative overflow-hidden">
      
      {/* iOS Stili Arka Plan Işık Efektleri (Glow Orbs) */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-amber-500/10 via-purple-500/10 to-blue-500/10 blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute top-1/2 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full" />

      <div>
        <Header />

        <main className="pb-24 pt-32 relative z-10">
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10">
            
            {/* SAYFA BAŞLIĞI VE GEZİNME */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/[0.06]">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-medium text-amber-300 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>{currentItem.committeeTitle}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white/95 truncate max-w-4xl">
                  {video.title}
                </h1>
                <p className="text-sm text-neutral-400 font-normal max-w-xl">
                  {currentItem.subjectTitle} • Akdeniz Üniversitesi Tıp Fakültesi Ders Arşivi
                </p>
              </div>

              {/* Önceki / Sonraki Ders Butonları */}
              <div className="flex items-center gap-2">
                {prevVideo ? (
                  <Link
                    href={`/ders/${prevVideo.id}`}
                    className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium rounded-2xl border border-white/[0.08] backdrop-blur-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>←</span>
                    <span>Önceki</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-white/[0.01] text-neutral-600 text-xs font-medium rounded-2xl border border-white/[0.03] cursor-not-allowed"
                  >
                    ← Önceki
                  </button>
                )}

                {nextVideo ? (
                  <Link
                    href={`/ders/${nextVideo.id}`}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold rounded-2xl transition-all shadow-lg shadow-amber-400/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>Sonraki</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-white/[0.01] text-neutral-600 text-xs font-medium rounded-2xl border border-white/[0.03] cursor-not-allowed"
                  >
                    Sonraki →
                  </button>
                )}
              </div>
            </div>

            {/* VİDEO VE İÇERİK ALANI */}
            <div className="space-y-8">
              
              {!user ? (
                <div className="relative aspect-video w-full rounded-3xl bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] flex flex-col items-center justify-center p-8 text-center shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-2xl shadow-amber-400/10 backdrop-blur-xl">
                    <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-medium text-white mb-2 tracking-tight">
                    Bu İçerik Yalnızca Kayıtlı Öğrencilere Özeldir
                  </h2>
                  
                  <p className="text-neutral-400 text-xs sm:text-sm max-w-md mb-6 leading-relaxed font-normal">
                    Ders arşivine erişmek ve notlarınızı senkronize etmek için hesabınıza giriş yapın.
                  </p>

                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs sm:text-sm transition-all shadow-xl shadow-amber-400/20 active:scale-95 cursor-pointer"
                  >
                    Giriş Yap / Kaydol
                  </button>
                </div>
              ) : (
                <div
                  ref={playerContainerRef}
                  className="relative group bg-black rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl select-none backdrop-blur-3xl"
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

                    {!isPlaying && (
                      <button
                        onClick={togglePlay}
                        className="absolute w-16 h-16 bg-amber-400 hover:bg-amber-300 text-black rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl transition-transform hover:scale-105 active:scale-95 z-20 cursor-pointer"
                      >
                        <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    )}

                    {/* Kontrol Bar */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex flex-col gap-3 z-30">
                      
                      <div className="relative w-full flex items-center">
                        <input
                          type="range"
                          min={0}
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1.5 bg-white/10 hover:h-2 rounded-lg appearance-none cursor-pointer accent-amber-400 transition-all"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={togglePlay}
                            className="text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
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
                              className="text-[11px] font-medium text-neutral-300 hover:text-white px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all cursor-pointer"
                            >
                              -10s
                            </button>
                            <button
                              onClick={() => skipTime(10)}
                              className="text-[11px] font-medium text-neutral-300 hover:text-white px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all cursor-pointer"
                            >
                              +10s
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pl-2">
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
                              className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                            />
                          </div>

                          <span className="text-xs font-mono text-neutral-400 pl-2">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <button
                              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                              className="text-xs font-medium bg-white/5 border border-white/10 hover:border-white/25 text-neutral-200 px-3 py-1.5 rounded-xl backdrop-blur-xl transition-all cursor-pointer"
                            >
                              {playbackRate}x
                            </button>

                            {showSpeedMenu && (
                              <div className="absolute right-0 bottom-11 w-28 bg-[#070709]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 space-y-0.5">
                                <div className="text-[10px] font-medium text-neutral-500 px-2 py-1">
                                  Hız Seçin
                                </div>
                                {speeds.map((rate) => (
                                  <button
                                    key={rate}
                                    onClick={() => changeSpeed(rate)}
                                    className={`w-full text-left text-xs font-medium px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                                      playbackRate === rate
                                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                        : "text-neutral-300 hover:bg-white/5 hover:text-white"
                                    }`}
                                  >
                                    <span>{rate}x</span>
                                    {playbackRate === rate && <span className="text-amber-400">✓</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={toggleFullscreen}
                            className="text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                            title="Tam Ekran"
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

              {/* AKSİYON BUTONLARI */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                  onClick={toggleCompleted}
                  className={`p-4 rounded-2xl border backdrop-blur-3xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    isCompleted
                      ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"
                      : "bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 border-white/[0.08]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span className="text-xs font-medium">{isCompleted ? "İzlendi" : "İzlendi İşaretle"}</span>
                </button>

                <button
                  onClick={togglePlaylist}
                  className={`p-4 rounded-2xl border backdrop-blur-3xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    isInPlaylist
                      ? "bg-amber-400/10 text-amber-300 border-amber-400/20"
                      : "bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 border-white/[0.08]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                  <span className="text-xs font-medium">{isInPlaylist ? "Listemde" : "Listeye Ekle"}</span>
                </button>

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
                  className="p-4 rounded-2xl border bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 border-white/[0.08] backdrop-blur-3xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
                  <span className="text-xs font-medium">Slayt (PDF)</span>
                </a>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="p-4 rounded-2xl border bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 border-white/[0.08] backdrop-blur-3xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />
                  <span className="text-xs font-medium">Sorun Bildir</span>
                </button>
              </div>

              {/* NOTLAR SEKSİYONU */}
              <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <div>
                    <h3 className="text-base font-medium text-white/95">Kişisel Ders Notları ({notes.length})</h3>
                    <p className="text-xs text-neutral-400">Dakikaya tıklayarak doğrudan o ana gidebilirsiniz.</p>
                  </div>
                </div>

                <form onSubmit={handleAddNote} className="space-y-4">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Bu ders için notlarınızı buraya yazın..."
                    rows={3}
                    className="w-full bg-black/40 border border-white/[0.08] focus:border-amber-400/80 rounded-2xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all backdrop-blur-xl"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeTimestamp}
                        onChange={(e) => setIncludeTimestamp(e.target.checked)}
                        className="accent-amber-400 rounded"
                      />
                      <span>Şu anki zamanı ekle ({formatTime(currentTime)})</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isNoteSubmitting || !newNoteContent.trim()}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-semibold text-xs rounded-2xl transition-all shadow-lg shadow-amber-400/20 cursor-pointer active:scale-95"
                    >
                      {isNoteSubmitting ? "Kaydediliyor..." : "Notu Kaydet"}
                    </button>
                  </div>
                </form>

                {notes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/20 rounded-2xl p-4 space-y-3 transition-all relative group"
                      >
                        <div className="flex items-center justify-between">
                          {note.timestamp !== null ? (
                            <button
                              onClick={() => jumpToTime(note.timestamp)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/10 border border-amber-400/20 rounded-xl text-amber-300 text-[11px] font-mono hover:bg-amber-400/20 transition-all cursor-pointer"
                            >
                              <span>{formatTime(note.timestamp)}</span>
                              <span>▶</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-neutral-500 font-mono">Genel Not</span>
                          )}

                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-neutral-500 hover:text-rose-400 transition-colors p-1 cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            ✕
                          </button>
                        </div>

                        <p className="text-xs text-neutral-300 font-normal leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Sorun Bildir Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#070709] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 relative shadow-2xl backdrop-blur-3xl">
            <h3 className="text-lg font-medium text-white">Videoda Sorun mu Var?</h3>
            <p className="text-xs text-neutral-400">
              Ses veya görüntü problemini açıklayın, admin paneline iletilecektir.
            </p>

            {reportSent ? (
              <div className="p-4 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl text-emerald-300 text-xs font-medium text-center">
                ✓ Bildiriminiz başarıyla iletildi.
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <textarea
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Sorunu kısaca belirtin..."
                  required
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="px-4 py-2 bg-white/5 text-neutral-300 text-xs font-medium rounded-xl hover:bg-white/10 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-medium rounded-xl transition-all cursor-pointer"
                  >
                    {reportSubmitting ? "Gönderiliyor..." : "Gönder"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser) => setUser(newUser)}
      />

      <Footer />
    </div>
  );
}