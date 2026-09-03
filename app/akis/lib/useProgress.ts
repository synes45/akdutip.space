// app/akis/lib/useProgress.ts
"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "akis_completed_video_ids";

export function useProgress() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: string[] = JSON.parse(raw);
        setCompletedIds(new Set(parsed));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const persist = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    } catch {
      // Ignore storage errors (e.g., private mode quota)
    }
  }, []);

  const markComplete = useCallback(
    (videoId: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.add(videoId);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const markIncomplete = useCallback(
    (videoId: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(videoId);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const toggleComplete = useCallback(
    (videoId: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(videoId)) {
          next.delete(videoId);
        } else {
          next.add(videoId);
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const isComplete = useCallback(
    (videoId: string) => completedIds.has(videoId),
    [completedIds]
  );

  return { completedIds, markComplete, markIncomplete, toggleComplete, isComplete };
}
