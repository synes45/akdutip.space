"use client";

import Link from "next/link";
import { Committee, Lesson } from "../data/courses"; // <- Burası güncellendi

interface Props {
  selectedCommittee: Committee;
  selectedLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson | null) => void;
}

export default function VideoGrid({ selectedCommittee, selectedLesson, onSelectLesson }: Props) {
  const lessons = selectedCommittee?.lessons || [];

  const filteredLessons = lessons.filter(
    (l) => !selectedLesson || l.id === selectedLesson.id
  );

  return (
    <div className="space-y-6 pt-4">
      {/* Ders Branş Filtreleri */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectLesson(null)}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap border ${
            selectedLesson === null
              ? "bg-yellow-500 text-black border-yellow-500 shadow-sm"
              : "bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
          }`}
        >
          Tüm Dersler
        </button>
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap border flex items-center gap-2 ${
              selectedLesson?.id === lesson.id
                ? "bg-yellow-500 text-black border-yellow-500 shadow-sm"
                : "bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
            }`}
          >
            <span>📖</span>
            <span>{lesson.name}</span>
          </button>
        ))}
      </div>

      {/* Video Posterleri */}
      {filteredLessons.length === 0 ? (
        <div className="p-8 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
          Bu komiteye henüz ders veya video eklenmemiş.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredLessons.flatMap((lesson) =>
            (lesson.videos || []).map((video) => (
              <Link
                key={video.id}
                href={`/ders/${video.id}`}
                className="group bg-neutral-900/80 rounded-2xl border border-neutral-800/80 overflow-hidden hover:border-neutral-600 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail / Görsel Alanı */}
                <div className="relative aspect-video bg-neutral-950 flex items-center justify-center overflow-hidden border-b border-neutral-800/50">
                  <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-yellow-950/20" />
                  
                  <span className="text-4xl relative z-10 opacity-30 group-hover:scale-[1.03] transition-transform duration-300">
                    📚
                  </span>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center shadow-md pl-0.5">
                      ▶
                    </div>
                  </div>

                  {/* Telegram ID Rozeti */}
                  <span className="absolute bottom-2.5 right-2.5 z-20 px-2 py-0.5 bg-black/80 rounded-md text-[11px] font-mono font-bold text-yellow-400 border border-neutral-800">
                    #{video.telegramId}
                  </span>
                </div>

                {/* Kart Bilgileri */}
                <div className="p-4 space-y-1.5 flex-1">
                  <span className="text-[11px] font-black text-yellow-400 uppercase tracking-wider block">
                    {lesson.name}
                  </span>
                  <h4 className="font-extrabold text-white text-base line-clamp-2 leading-snug group-hover:text-yellow-400 transition-colors">
                    {video.title}
                  </h4>
                </div>

                {/* Alt Aksiyon Çubuğu */}
                <div className="px-4 py-2.5 bg-neutral-950/60 border-t border-neutral-800/40 flex items-center justify-between text-xs font-semibold text-neutral-400 group-hover:text-white transition-colors">
                  <span>Dersi İzle</span>
                  <span className="text-yellow-400 transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}