// app/akis/components/VideoPlayer.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { MockVideo } from "../lib/mockData";

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5] as const;

interface Props {
  video: MockVideo | null;
  onEnded: () => void;
  onTimeUpdate: (currentTime: number) => void;
}

/** Returns a placeholder Telegram proxy URL — replace with real stream URL logic */
function getVideoSrc(video: MockVideo): string {
  // In production this would resolve to your actual stream endpoint.
  // Using a publicly-accessible Big Buck Bunny clip as a working demo.
  return `https://www.w3schools.com/html/mov_bbb.mp4`;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function VideoPlayer({ video, onEnded, onTimeUpdate }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset player state when video changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [video?.id]);

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Sync volume / mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Auto-hide controls after 3s of inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = t;
    }
    setCurrentTime(t);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => setIsMuted((m) => !m);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (!video) {
    return (
      <div className="w-full aspect-video bg-neutral-900 rounded-2xl flex flex-col items-center justify-center gap-4 border border-neutral-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 text-neutral-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"
          />
        </svg>
        <p className="text-sm font-semibold text-neutral-500">
          Sol menüden bir ders seçin
        </p>
      </div>
    );
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
      onTouchStart={resetHideTimer}
    >
      {/* ── Video element ── */}
      <video
        ref={videoRef}
        src={getVideoSrc(video)}
        className="w-full h-full object-contain"
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => { setIsPlaying(true); resetHideTimer(); }}
        onPause={() => { setIsPlaying(false); setShowControls(true); }}
        onEnded={() => { setIsPlaying(false); setShowControls(true); onEnded(); }}
        onTimeUpdate={(e) => {
          const t = (e.target as HTMLVideoElement).currentTime;
          setCurrentTime(t);
          onTimeUpdate(t);
        }}
        onLoadedMetadata={(e) =>
          setDuration((e.target as HTMLVideoElement).duration)
        }
        onDurationChange={(e) =>
          setDuration((e.target as HTMLVideoElement).duration)
        }
      />

      {/* ── Big play button overlay (shown when paused) ── */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          aria-label="Oynat"
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-yellow-500 text-black flex items-center justify-center shadow-2xl shadow-yellow-500/30 pl-1 hover:scale-105 transition-transform duration-200">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* ── Controls bar ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pt-8 pb-3 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Seek bar */}
        <div className="relative w-full mb-3 group/seek">
          {/* Buffered / progress track */}
          <div className="relative h-1 w-full bg-white/20 rounded-full">
            <div
              className="absolute h-full bg-yellow-500 rounded-full pointer-events-none"
              style={{ width: `${pct}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            aria-label="Zaman çubuğu"
          />
        </div>

        {/* Bottom controls row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left cluster */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Duraklat" : "Oynat"}
              className="text-white hover:text-yellow-400 transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
                className="text-white hover:text-yellow-400 transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0 2-2m-2 2-2-2m2 2 2 2" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 0 1 0 7.072M12 6 6.75 11.25H3v1.5h3.75L12 18V6zM18.364 5.636a9 9 0 0 1 0 12.728" />
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
                className="w-0 overflow-hidden group-hover/vol:w-16 transition-all duration-300 cursor-pointer accent-yellow-500"
                aria-label="Ses düzeyi"
              />
            </div>

            {/* Time */}
            <span className="text-xs text-white/80 font-mono tabular-nums select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            {/* Speed selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu((s) => !s)}
                className="text-xs font-bold text-white/80 hover:text-yellow-400 transition-colors px-2 py-1 rounded border border-white/20 hover:border-yellow-400/50 cursor-pointer"
              >
                {playbackRate}×
              </button>
              {showSpeedMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSpeedMenu(false)}
                  />
                  <div className="absolute bottom-full right-0 mb-2 bg-neutral-900 border border-neutral-700 rounded-xl py-1 z-20 shadow-2xl min-w-[80px]">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setPlaybackRate(s);
                          setShowSpeedMenu(false);
                        }}
                        className={`w-full text-left px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                          playbackRate === s
                            ? "text-yellow-400 bg-yellow-500/10"
                            : "text-neutral-300 hover:text-white hover:bg-neutral-800"
                        }`}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
              className="text-white/80 hover:text-yellow-400 transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
