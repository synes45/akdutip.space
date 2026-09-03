"use client";

import { useState } from "react";
import Link from "next/link";
import { Committee, Lesson } from "../data/courses";

interface Props {
  selectedCommittee: Committee;
  selectedLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson | null) => void;
}

export default function VideoGrid({ selectedCommittee, selectedLesson, onSelectLesson }: Props) {
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const lessons = selectedCommittee?.lessons || [];

  const filteredLessons = lessons.filter(
    (l) => !selectedLesson || l.id === selectedLesson.id
  );

  return (
    <div className="space-y-6 pt-2">
      {/* Ders Branş Filtreleri (Glass Bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectLesson(null)}
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium transition-all duration-300 whitespace-nowrap cursor-pointer backdrop-blur-md border active:scale-95 ${
            selectedLesson === null
              ? "bg-amber-400 text-black border-amber-400 font-semibold shadow-md shadow-amber-400/20"
              : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          Tüm Dersler
        </button>
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium transition-all duration-300 whitespace-nowrap cursor-pointer backdrop-blur-md border active:scale-95 ${
              selectedLesson?.id === lesson.id
                ? "bg-amber-400 text-black border-amber-400 font-semibold shadow-md shadow-amber-400/20"
                : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <span>{lesson.name}</span>
          </button>
        ))}
      </div>

      {/* Video Kartları Grid Yapısı */}
      {filteredLessons.length === 0 ? (
        <div className="p-12 text-center bg-white/[0.015] backdrop-blur-3xl border border-white/[0.08] rounded-3xl space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-neutral-500 mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs text-neutral-400 font-normal">
            Bu komiteye henüz ders veya video eklenmemiş.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredLessons.flatMap((lesson) =>
            (lesson.videos || []).map((video: any) => {
              const isHovered = hoveredVideoId === video.id;

              const telegramChannel = video.channelUsername || (selectedCommittee as any)?.telegramChannel || "donem2dersmateryal";
              const thumbSrc = video.thumbnailUrl || (video.telegramId ? `/api/telegram-thumb?channel=${telegramChannel}&id=${video.telegramId}` : "");

              return (
                <Link
                  key={video.id}
                  href={`/ders/${video.id}`}
                  onMouseEnter={() => setHoveredVideoId(video.id)}
                  onMouseLeave={() => setHoveredVideoId(null)}
                  className="group flex flex-col gap-2.5 cursor-pointer transition-all duration-300"
                >
                  {/* Thumbnail & Glass Frame */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/60 border border-white/[0.08] group-hover:border-white/20 transition-all duration-300 shadow-xl">
                    {/* Önizleme Videosu */}
                    {video.previewUrl ? (
                      isHovered ? (
                        <video
                          src={video.previewUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover z-10"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
                          style={{ backgroundImage: `url('${thumbSrc || "/placeholder.jpg"}')` }}
                        />
                      )
                    ) : (
                      /* Görsel Thumbnail */
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
                        style={{ backgroundImage: thumbSrc ? `url('${thumbSrc}')` : undefined }}
                      >
                        {!thumbSrc && (
                          <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center">
                            <svg className="w-6 h-6 text-neutral-700 group-hover:text-amber-400/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

                    {/* Play Hover Icon */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/30 pl-0.5 transform scale-90 group-hover:scale-100 transition-all duration-300">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Süre / Telegram ID Etiketi */}
                    <span className="absolute bottom-2 right-2 z-20 px-2 py-0.5 bg-black/60 rounded-full text-[10px] font-mono font-medium text-amber-300 border border-white/10 backdrop-blur-md">
                      {video.duration || `#${video.telegramId}`}
                    </span>
                  </div>

                  {/* Alt Bilgiler */}
                  <div className="flex flex-col gap-0.5 px-0.5">
                    <h4 className="font-medium text-xs text-white/90 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors duration-200">
                      {video.title}
                    </h4>
                    <span className="text-[10px] font-medium text-neutral-400 tracking-wide uppercase">
                      {lesson.name}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}