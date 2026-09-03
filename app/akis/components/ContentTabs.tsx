// app/akis/components/ContentTabs.tsx
"use client";

import { useState, useRef } from "react";
import { MockVideo } from "../lib/mockData";
import {
  TimestampNote,
  formatTimestamp,
  useTimestampNotes,
} from "../lib/useTimestampNotes";

interface Props {
  video: MockVideo | null;
  currentTime: number;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onSeekTo: (time: number) => void;
}

type Tab = "details" | "notes";

export default function ContentTabs({
  video,
  currentTime,
  isCompleted,
  onToggleComplete,
  onSeekTo,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [noteInput, setNoteInput] = useState("");
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { notes, addNote, deleteNote } = useTimestampNotes(video?.id ?? null);

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteInput.trim() || !video) return;
    addNote(noteInput, includeTimestamp ? Math.floor(currentTime) : null);
    setNoteInput("");
    textareaRef.current?.focus();
  }

  const tabBase =
    "px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer";
  const tabActive = "bg-neutral-700 text-white";
  const tabInactive = "text-neutral-400 hover:text-white hover:bg-neutral-800";

  return (
    <div className="flex flex-col gap-0">
      {/* Tab headers */}
      <div className="flex items-center gap-1 p-1 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
        <button
          className={`${tabBase} ${activeTab === "details" ? tabActive : tabInactive} flex items-center gap-2`}
          onClick={() => setActiveTab("details")}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
          </svg>
          Ders Detayı &amp; PDF
        </button>
        <button
          className={`${tabBase} ${activeTab === "notes" ? tabActive : tabInactive} flex items-center gap-2 relative`}
          onClick={() => setActiveTab("notes")}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Zaman Damgalı Notlar
          {notes.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-black text-[9px] font-black rounded-full flex items-center justify-center">
              {notes.length > 9 ? "9+" : notes.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "details" && (
          <DetailsTab
            video={video}
            isCompleted={isCompleted}
            onToggleComplete={onToggleComplete}
          />
        )}
        {activeTab === "notes" && (
          <NotesTab
            video={video}
            notes={notes}
            noteInput={noteInput}
            onNoteInputChange={setNoteInput}
            includeTimestamp={includeTimestamp}
            onToggleTimestamp={() => setIncludeTimestamp((t) => !t)}
            currentTime={currentTime}
            onAddNote={handleAddNote}
            onDeleteNote={deleteNote}
            onSeekTo={onSeekTo}
            textareaRef={textareaRef}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Details Tab ─────────────────────────────────────────────── */

function DetailsTab({
  video,
  isCompleted,
  onToggleComplete,
}: {
  video: MockVideo | null;
  isCompleted: boolean;
  onToggleComplete: () => void;
}) {
  if (!video) {
    return (
      <div className="py-12 text-center text-sm text-neutral-500">
        Bir ders seçmek için sol menüyü kullanın.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Lecture info card */}
      <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-2xl p-5 space-y-4">
        {/* Title */}
        <h2 className="text-lg font-black text-white leading-snug">
          {video.title}
        </h2>

        {/* Professor */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-black text-sm shrink-0">
            {video.professor.split(" ").pop()?.charAt(0) ?? "?"}
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{video.professor}</p>
            <p className="text-[10px] text-neutral-500">Öğretim Üyesi</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            {video.duration}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium font-mono">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1z" />
            </svg>
            #{video.telegramId}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          {/* Mark complete toggle */}
          <button
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer border ${
              isCompleted
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                : "bg-neutral-700/50 border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white"
            }`}
          >
            {isCompleted ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                İzlendi
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                </svg>
                İzlendi Olarak İşaretle
              </>
            )}
          </button>

          {/* PDF download */}
          {video.pdfUrl ? (
            <a
              href={video.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 hover:bg-yellow-500/20 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0-3-3m3 3 3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
              </svg>
              Slaytları İndir
            </a>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-neutral-800/50 border border-neutral-700/50 text-neutral-500 select-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              PDF Mevcut Değil
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Notes Tab ───────────────────────────────────────────────── */

function NotesTab({
  video,
  notes,
  noteInput,
  onNoteInputChange,
  includeTimestamp,
  onToggleTimestamp,
  currentTime,
  onAddNote,
  onDeleteNote,
  onSeekTo,
  textareaRef,
}: {
  video: MockVideo | null;
  notes: TimestampNote[];
  noteInput: string;
  onNoteInputChange: (v: string) => void;
  includeTimestamp: boolean;
  onToggleTimestamp: () => void;
  currentTime: number;
  onAddNote: (e: React.FormEvent) => void;
  onDeleteNote: (id: string) => void;
  onSeekTo: (time: number) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  if (!video) {
    return (
      <div className="py-12 text-center text-sm text-neutral-500">
        Not eklemek için önce bir ders seçin.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Add note form */}
      <form onSubmit={onAddNote} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={noteInput}
            onChange={(e) => onNoteInputChange(e.target.value)}
            placeholder="Notunuzu buraya yazın..."
            rows={3}
            className="w-full bg-neutral-800/50 border border-neutral-700 focus:border-yellow-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none resize-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Timestamp toggle */}
          <button
            type="button"
            onClick={onToggleTimestamp}
            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              includeTimestamp
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            {includeTimestamp
              ? `Zaman damgası: ${formatTimestamp(Math.floor(currentTime))}`
              : "Zaman damgası yok"}
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={!noteInput.trim()}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-yellow-500 text-black text-xs font-black hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Not Ekle
          </button>
        </div>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-3 text-center">
          <svg className="w-10 h-10 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
          <p className="text-xs text-neutral-500 font-medium">
            Bu ders için henüz not eklenmedi.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={() => onDeleteNote(note.id)}
              onSeekTo={note.timestamp !== null ? () => onSeekTo(note.timestamp!) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  onDelete,
  onSeekTo,
}: {
  note: TimestampNote;
  onDelete: () => void;
  onSeekTo?: () => void;
}) {
  const date = new Date(note.createdAt);
  const dateStr = date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-4 space-y-2 hover:border-neutral-600 transition-colors">
      {/* Timestamp chip */}
      {note.timestamp !== null && (
        <button
          onClick={onSeekTo}
          className="inline-flex items-center gap-1.5 text-[10px] font-black text-yellow-400 bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-0.5 rounded-full hover:bg-yellow-500/20 transition-colors cursor-pointer"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          </svg>
          {formatTimestamp(note.timestamp)}
        </button>
      )}

      {/* Note content */}
      <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
        {note.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-neutral-500">{dateStr}</span>
        <button
          onClick={onDelete}
          aria-label="Notu sil"
          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 7-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
