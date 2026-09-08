"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
      {/* Ders Branş Filtreleri — backdrop-blur kaldırıldı */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectLesson(null)}
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer border active:scale-95 ${
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
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer border active:scale-95 ${
              selectedLesson?.id === lesson.id
                ? "bg-amber-400 text-black border-amber-400 font-semibold shadow-md shadow-amber-400/20"
                : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <span>{lesson.name}</span>
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {filteredLessons.length === 0 ? (
        <div className="p-12 text-center bg-white/[0.015] border border-white/[0.08] rounded-3xl space-y-2">
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
              const telegramChannel =
                video.channelUsername ||
                (selectedCommittee as any)?.telegramChannel ||
                "donem2dersmateryal";
              // Telegram ID temizleme (eğer URL veya path geldiyse sadece son id numarasını al)
              let cleanId = video.telegramId ? String(video.telegramId).trim() : "";
              if (cleanId.includes("/")) {
                const parts = cleanId.split("/").filter(Boolean);
                cleanId = parts[parts.length - 1];
              }

              const thumbSrc = video.thumbnailUrl ||
                (cleanId
                  ? `/api/telegram-thumb?channel=${telegramChannel}&id=${cleanId}`
                  : "");

              return (
                <Link
                  key={video.id}
                  href={`/ders/${video.id}`}
                  onMouseEnter={() => setHoveredVideoId(video.id)}
                  onMouseLeave={() => setHoveredVideoId(null)}
                  className="group flex flex-col gap-2.5 cursor-pointer [content-visibility:auto] [contain-intrinsic-size:auto_180px]"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/[0.08] md:group-hover:border-white/20 transition-colors shadow-md md:shadow-xl">
                    {/* Preview video (hover) */}
                    {video.previewUrl && isHovered ? (
                      <video
                        src={video.previewUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-10"
                      />
                    ) : thumbSrc ? (
                      /* Standart HTML5 img: 302 redirect ve telegram telesco.pe cdn ile tam uyumlu & hafif */
                      <img
                        src={thumbSrc}
                        alt={video.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover md:transition-transform md:duration-300 md:group-hover:scale-105"
                        onError={(e) => {
                          // Resim yüklenemezse kırık ikon yerine arka plan placeholder'ı göster
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center">
                        <svg className="w-6 h-6 text-neutral-700 md:group-hover:text-amber-400/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none z-10" />

                    {/* Play icon (hover) */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20 pointer-events-none">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/30 pl-0.5">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>

                    {/* Etiket */}
                    <span className="absolute bottom-2 right-2 z-20 px-2 py-0.5 bg-black/70 rounded-full text-[10px] font-mono font-medium text-amber-300 border border-white/10">
                      {video.duration || `#${video.telegramId}`}
                    </span>
                  </div>

                  {/* Alt bilgiler */}
                  <div className="flex flex-col gap-0.5 px-0.5">
                    <h4 className="font-medium text-xs text-white/90 line-clamp-2 leading-snug md:group-hover:text-amber-300 transition-colors duration-200">
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