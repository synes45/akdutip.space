// app/akis/components/Sidebar.tsx
"use client";

import { useState, useMemo } from "react";
import { MockDonem, MockCommittee, MockLesson, MockVideo } from "../lib/mockData";

interface Props {
  data: MockDonem[];
  completedIds: Set<string>;
  currentVideoId: string | null;
  searchQuery: string;
  onSelectVideo: (video: MockVideo, committee: MockCommittee) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  data,
  completedIds,
  currentVideoId,
  searchQuery,
  onSelectVideo,
  isOpen,
  onClose,
}: Props) {
  // Track open accordion items: donem and committee IDs
  const [openDonems, setOpenDonems] = useState<Set<string>>(
    () => new Set(data.map((d) => d.id))
  );
  const [openCommittees, setOpenCommittees] = useState<Set<string>>(
    () => new Set<string>()
  );
  const [openLessons, setOpenLessons] = useState<Set<string>>(
    () => new Set<string>()
  );

  const query = searchQuery.trim().toLowerCase();

  // Compute filtered data for search highlight
  const filteredData = useMemo(() => {
    if (!query) return data;
    return data
      .map((donem) => ({
        ...donem,
        committees: donem.committees
          .map((committee) => ({
            ...committee,
            lessons: committee.lessons
              .map((lesson) => ({
                ...lesson,
                videos: lesson.videos.filter(
                  (v) =>
                    v.title.toLowerCase().includes(query) ||
                    v.professor.toLowerCase().includes(query) ||
                    lesson.name.toLowerCase().includes(query) ||
                    committee.title.toLowerCase().includes(query)
                ),
              }))
              .filter((l) => l.videos.length > 0),
          }))
          .filter((c) => c.lessons.length > 0),
      }))
      .filter((d) => d.committees.length > 0);
  }, [data, query]);

  function toggleDonem(id: string) {
    setOpenDonems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleCommittee(id: string) {
    setOpenCommittees((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleLesson(id: string) {
    setOpenLessons((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-72 bg-neutral-900 border-r border-neutral-800
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:h-auto lg:flex lg:shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Ders navigasyonu"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm font-black text-white">Ders Arşivi</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
            aria-label="Menüyü kapat"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable tree */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">
          {filteredData.length === 0 && query ? (
            <div className="px-4 py-8 text-center text-xs text-neutral-500">
              &ldquo;{searchQuery}&rdquo; için sonuç bulunamadı.
            </div>
          ) : (
            filteredData.map((donem) => (
              <DonemAccordion
                key={donem.id}
                donem={donem}
                isOpen={openDonems.has(donem.id)}
                onToggle={() => toggleDonem(donem.id)}
                openCommittees={openCommittees}
                onToggleCommittee={toggleCommittee}
                openLessons={openLessons}
                onToggleLesson={toggleLesson}
                completedIds={completedIds}
                currentVideoId={currentVideoId}
                onSelectVideo={onSelectVideo}
                searchQuery={query}
              />
            ))
          )}
        </nav>
      </aside>
    </>
  );
}

/* ─── Dönem Accordion ──────────────────────────────────────────── */

function DonemAccordion({
  donem,
  isOpen,
  onToggle,
  openCommittees,
  onToggleCommittee,
  openLessons,
  onToggleLesson,
  completedIds,
  currentVideoId,
  onSelectVideo,
  searchQuery,
}: {
  donem: MockDonem;
  isOpen: boolean;
  onToggle: () => void;
  openCommittees: Set<string>;
  onToggleCommittee: (id: string) => void;
  openLessons: Set<string>;
  onToggleLesson: (id: string) => void;
  completedIds: Set<string>;
  currentVideoId: string | null;
  onSelectVideo: (v: MockVideo, c: MockCommittee) => void;
  searchQuery: string;
}) {
  const totalVideos = donem.committees.reduce(
    (a, c) => a + c.lessons.reduce((b, l) => b + l.videos.length, 0),
    0
  );
  const completedCount = donem.committees.reduce(
    (a, c) =>
      a + c.lessons.reduce((b, l) => b + l.videos.filter((v) => completedIds.has(v.id)).length, 0),
    0
  );

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg mx-1 hover:bg-neutral-800 transition-colors text-left cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-xs font-black text-neutral-200 uppercase tracking-wider">
            {donem.name}
          </span>
        </div>
        <span className="text-[10px] text-neutral-500 tabular-nums font-mono">
          {completedCount}/{totalVideos}
        </span>
      </button>

      {isOpen && (
        <div className="pl-2">
          {donem.committees.map((committee) => (
            <CommitteeAccordion
              key={committee.id}
              committee={committee}
              isOpen={openCommittees.has(committee.id)}
              onToggle={() => onToggleCommittee(committee.id)}
              openLessons={openLessons}
              onToggleLesson={onToggleLesson}
              completedIds={completedIds}
              currentVideoId={currentVideoId}
              onSelectVideo={onSelectVideo}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Committee Accordion ─────────────────────────────────────── */

function CommitteeAccordion({
  committee,
  isOpen,
  onToggle,
  openLessons,
  onToggleLesson,
  completedIds,
  currentVideoId,
  onSelectVideo,
  searchQuery,
}: {
  committee: MockCommittee;
  isOpen: boolean;
  onToggle: () => void;
  openLessons: Set<string>;
  onToggleLesson: (id: string) => void;
  completedIds: Set<string>;
  currentVideoId: string | null;
  onSelectVideo: (v: MockVideo, c: MockCommittee) => void;
  searchQuery: string;
}) {
  const totalVideos = committee.lessons.reduce((a, l) => a + l.videos.length, 0);
  const completedCount = committee.lessons.reduce(
    (a, l) => a + l.videos.filter((v) => completedIds.has(v.id)).length,
    0
  );
  const pct = totalVideos === 0 ? 0 : Math.round((completedCount / totalVideos) * 100);

  return (
    <div className="mb-0.5">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between px-3 py-2 rounded-lg mx-1 hover:bg-neutral-800/70 transition-colors text-left cursor-pointer group"
      >
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <svg
            className={`w-3 h-3 text-neutral-500 mt-0.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
          <div className="min-w-0 flex-1 space-y-1">
            <span className="text-[11px] font-bold text-neutral-300 block leading-tight">
              {committee.title.replace(" — ", " · ")}
            </span>
            {/* Mini progress bar */}
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-0.5 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-400" : "bg-yellow-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-[9px] font-black tabular-nums shrink-0 ${pct === 100 ? "text-emerald-400" : "text-neutral-500"}`}>
                {pct}%
              </span>
            </div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="pl-3">
          {committee.lessons.map((lesson) => (
            <LessonAccordion
              key={lesson.id}
              lesson={lesson}
              committee={committee}
              isOpen={openLessons.has(lesson.id)}
              onToggle={() => onToggleLesson(lesson.id)}
              completedIds={completedIds}
              currentVideoId={currentVideoId}
              onSelectVideo={onSelectVideo}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Lesson Accordion ────────────────────────────────────────── */

function LessonAccordion({
  lesson,
  committee,
  isOpen,
  onToggle,
  completedIds,
  currentVideoId,
  onSelectVideo,
  searchQuery,
}: {
  lesson: MockLesson;
  committee: MockCommittee;
  isOpen: boolean;
  onToggle: () => void;
  completedIds: Set<string>;
  currentVideoId: string | null;
  onSelectVideo: (v: MockVideo, c: MockCommittee) => void;
  searchQuery: string;
}) {
  const allDone = lesson.videos.every((v) => completedIds.has(v.id));

  return (
    <div className="mb-0.5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg mx-1 hover:bg-neutral-800/50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className={`w-2.5 h-2.5 text-neutral-600 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-[10px] font-bold text-neutral-400 truncate uppercase tracking-widest">
            {lesson.name}
          </span>
        </div>
        {allDone && (
          <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="pl-2 pb-1 space-y-0.5">
          {lesson.videos.map((video) => (
            <VideoItem
              key={video.id}
              video={video}
              isCompleted={completedIds.has(video.id)}
              isPlaying={video.id === currentVideoId}
              onClick={() => onSelectVideo(video, committee)}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Video Item ──────────────────────────────────────────────── */

function VideoItem({
  video,
  isCompleted,
  isPlaying,
  onClick,
  searchQuery,
}: {
  video: MockVideo;
  isCompleted: boolean;
  isPlaying: boolean;
  onClick: () => void;
  searchQuery: string;
}) {
  function highlight(text: string): React.ReactNode {
    if (!searchQuery) return text;
    const idx = text.toLowerCase().indexOf(searchQuery);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-500/30 text-yellow-300 rounded-sm">{text.slice(idx, idx + searchQuery.length)}</mark>
        {text.slice(idx + searchQuery.length)}
      </>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all cursor-pointer group/item ${
        isPlaying
          ? "bg-yellow-500/10 border border-yellow-500/30"
          : "hover:bg-neutral-800/60 border border-transparent"
      }`}
    >
      {/* Status indicator */}
      <div className="shrink-0 w-4 h-4 flex items-center justify-center">
        {isPlaying ? (
          /* Playing bars animation */
          <span className="flex items-end gap-px h-3">
            <span className="w-0.5 bg-yellow-400 rounded-full animate-[soundbar_0.8s_ease-in-out_infinite]" style={{ height: "60%" }} />
            <span className="w-0.5 bg-yellow-400 rounded-full animate-[soundbar_0.8s_ease-in-out_0.2s_infinite]" style={{ height: "100%" }} />
            <span className="w-0.5 bg-yellow-400 rounded-full animate-[soundbar_0.8s_ease-in-out_0.4s_infinite]" style={{ height: "40%" }} />
          </span>
        ) : isCompleted ? (
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-neutral-600 group-hover/item:text-neutral-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
          </svg>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[11px] font-semibold leading-snug line-clamp-2 ${
            isPlaying
              ? "text-yellow-300"
              : isCompleted
              ? "text-neutral-400 line-through decoration-neutral-600"
              : "text-neutral-300 group-hover/item:text-white"
          }`}
        >
          {highlight(video.title)}
        </p>
        <p className="text-[9px] text-neutral-600 mt-0.5 font-mono">
          {video.duration}
        </p>
      </div>
    </button>
  );
}
