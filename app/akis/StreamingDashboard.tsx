// app/akis/StreamingDashboard.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { MOCK_DATA, MockVideo, MockCommittee } from "./lib/mockData";
import { useProgress } from "./lib/useProgress";
import Sidebar from "./components/Sidebar";
import VideoPlayer from "./components/VideoPlayer";
import ContentTabs from "./components/ContentTabs";
import CommitteeProgress from "./components/CommitteeProgress";
import SearchBar from "./components/SearchBar";
import ThemeToggle from "./components/ThemeToggle";

export default function StreamingDashboard() {
  const [currentVideo, setCurrentVideo] = useState<MockVideo | null>(null);
  const [currentCommittee, setCurrentCommittee] = useState<MockCommittee | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { completedIds, markComplete, toggleComplete, isComplete } = useProgress();

  // videoRef for seek from note timestamp
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleSelectVideo = useCallback(
    (video: MockVideo, committee: MockCommittee) => {
      setCurrentVideo(video);
      setCurrentCommittee(committee);
      setCurrentTime(0);
      setSidebarOpen(false); // close drawer on mobile after selection
    },
    []
  );

  const handleVideoEnded = useCallback(() => {
    if (currentVideo) {
      markComplete(currentVideo.id);
    }
  }, [currentVideo, markComplete]);

  const handleTimeUpdate = useCallback((t: number) => {
    setCurrentTime(t);
  }, []);

  const handleSeekTo = useCallback((time: number) => {
    // Find the native video element and seek it
    const videoEl = document.querySelector<HTMLVideoElement>("video");
    if (videoEl) {
      videoEl.currentTime = time;
      videoEl.play();
    }
  }, []);

  const handleToggleComplete = useCallback(() => {
    if (currentVideo) {
      toggleComplete(currentVideo.id);
    }
  }, [currentVideo, toggleComplete]);

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      {/* ── Sidebar ── */}
      <Sidebar
        data={MOCK_DATA}
        completedIds={completedIds}
        currentVideoId={currentVideo?.id ?? null}
        searchQuery={searchQuery}
        onSelectVideo={handleSelectVideo}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top header bar ── */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md shrink-0">
          {/* Hamburger (mobile / tablet) */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Menüyü aç"
            className="lg:hidden p-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo / Brand */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-black text-sm">
              A
            </div>
            <span className="text-sm font-black text-white tracking-tight">
              Akdeniz <span className="text-yellow-400">Tıp</span>
            </span>
          </div>

          <div className="hidden sm:block w-px h-5 bg-neutral-700 shrink-0" />

          {/* Search bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Ders, hoca veya konu ara..."
          />

          {/* Progress (desktop) */}
          {currentCommittee && (
            <div className="hidden md:flex items-center min-w-[200px] max-w-[260px] shrink-0">
              <CommitteeProgress
                committee={currentCommittee}
                completedIds={completedIds}
              />
            </div>
          )}

          {/* Theme toggle */}
          <ThemeToggle />
        </header>

        {/* ── Scrollable content area ── */}
        <main className="flex-1 overflow-y-auto scrollbar-none">
          <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
            {/* Breadcrumb */}
            {currentVideo && currentCommittee && (
              <nav className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium flex-wrap" aria-label="Konum">
                <span className="text-yellow-500 font-bold">
                  {/* Find dönem name */}
                  {MOCK_DATA.find((d) =>
                    d.committees.some((c) => c.id === currentCommittee.id)
                  )?.name}
                </span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
                <span>{currentCommittee.title.split(" — ")[0]}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
                <span className="text-white">{currentVideo.title}</span>
              </nav>
            )}

            {/* Mobile progress bar */}
            {currentCommittee && (
              <div className="md:hidden">
                <CommitteeProgress
                  committee={currentCommittee}
                  completedIds={completedIds}
                />
              </div>
            )}

            {/* Video player */}
            <VideoPlayer
              video={currentVideo}
              onEnded={handleVideoEnded}
              onTimeUpdate={handleTimeUpdate}
            />

            {/* Content tabs */}
            <ContentTabs
              video={currentVideo}
              currentTime={currentTime}
              isCompleted={currentVideo ? isComplete(currentVideo.id) : false}
              onToggleComplete={handleToggleComplete}
              onSeekTo={handleSeekTo}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
