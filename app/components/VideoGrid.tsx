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
    <div className="space-y-4 pt-2">
      {/* Ders Branş Filtreleri */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectLesson(null)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer border ${
            selectedLesson === null
              ? "bg-amber-400 text-black border-amber-400 font-bold"
              : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
          }`}
        >
          Tüm Dersler
        </button>
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
              selectedLesson?.id === lesson.id
                ? "bg-amber-400 text-black border-amber-400 font-bold"
                : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
            }`}
          >
            <span>{lesson.name}</span>
          </button>
        ))}
      </div>

      {/* Video Kartları Grid Yapısı */}
      {filteredLessons.length === 0 ? (
        <div className="p-8 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl text-xs">
          Bu komiteye henüz ders veya video eklenmemiş.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredLessons.flatMap((lesson) =>
            (lesson.videos || []).map((video: any) => {
              const isHovered = hoveredVideoId === video.id;

              // Telegram kapak resmi kaynağı (Kanal adı donem2dersmateryal olarak güncellendi)
              const telegramChannel = video.channelUsername || (selectedCommittee as any)?.telegramChannel || "donem2dersmateryal";
              const thumbSrc = video.thumbnailUrl || (video.telegramId ? `/api/telegram-thumb?channel=${telegramChannel}&id=${video.telegramId}` : "");

              return (
                <Link
                  key={video.id}
                  href={`/ders/${video.id}`}
                  onMouseEnter={() => setHoveredVideoId(video.id)}
                  onMouseLeave={() => setHoveredVideoId(null)}
                  className="group flex flex-col gap-1.5 cursor-pointer transition-all duration-200"
                >
                  {/* Thumbnail & Önizleme Alanı */}
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800/60 group-hover:border-zinc-700 transition-colors">
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
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url('${thumbSrc || "/placeholder.jpg"}')` }}
                        />
                      )
                    ) : (
                      /* Görsel Thumbnail */
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: thumbSrc ? `url('${thumbSrc}')` : undefined }}
                      >
                        {!thumbSrc && (
                          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                            <svg className="w-6 h-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Gölge Maskesi */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Süre / Telegram ID Etiketi */}
                    <span className="absolute bottom-1 right-1 z-20 px-1 py-0.2 bg-black/80 rounded text-[9px] font-mono text-zinc-300 backdrop-blur-sm">
                      {video.duration || `#${video.telegramId}`}
                    </span>
                  </div>

                  {/* Alt Bilgiler: Önce Video Adı, Sonra Ders Adı */}
                  <div className="flex flex-col gap-0.5 px-0.5">
                    <h4 className="font-semibold text-[11px] sm:text-xs text-zinc-200 line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">
                      {video.title}
                    </h4>
                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 font-medium tracking-wide uppercase">
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