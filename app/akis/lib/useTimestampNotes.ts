// app/akis/lib/useTimestampNotes.ts
"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY_PREFIX = "akis_notes_";

export interface TimestampNote {
  id: string;
  content: string;
  timestamp: number | null; // seconds into the video, null = no timestamp
  createdAt: string; // ISO date string
}

function storageKey(videoId: string): string {
  return `${STORAGE_KEY_PREFIX}${videoId}`;
}

function loadNotes(videoId: string): TimestampNote[] {
  try {
    const raw = localStorage.getItem(storageKey(videoId));
    if (raw) {
      return JSON.parse(raw) as TimestampNote[];
    }
  } catch {
    // Ignore
  }
  return [];
}

function saveNotes(videoId: string, notes: TimestampNote[]): void {
  try {
    localStorage.setItem(storageKey(videoId), JSON.stringify(notes));
  } catch {
    // Ignore
  }
}

/** Formats seconds into MM:SS or HH:MM:SS */
export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useTimestampNotes(videoId: string | null) {
  const [notes, setNotes] = useState<TimestampNote[]>([]);

  // Reload notes whenever the active video changes
  useEffect(() => {
    if (!videoId) {
      setNotes([]);
      return;
    }
    setNotes(loadNotes(videoId));
  }, [videoId]);

  const addNote = useCallback(
    (content: string, timestamp: number | null) => {
      if (!videoId) return;
      const note: TimestampNote = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        content: content.trim(),
        timestamp,
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => {
        // Newest notes first
        const next = [note, ...prev];
        saveNotes(videoId, next);
        return next;
      });
    },
    [videoId]
  );

  const deleteNote = useCallback(
    (noteId: string) => {
      if (!videoId) return;
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== noteId);
        saveNotes(videoId, next);
        return next;
      });
    },
    [videoId]
  );

  return { notes, addNote, deleteNote };
}
