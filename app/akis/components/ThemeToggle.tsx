// app/akis/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "akis_theme";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Sync with stored preference on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark =
      stored !== null ? stored === "dark" : true; // default: dark
    applyTheme(prefersDark);
    setIsDark(prefersDark);
  }, []);

  function applyTheme(dark: boolean) {
    if (dark) {
      document.documentElement.classList.add("akis-dark");
      document.documentElement.classList.remove("akis-light");
    } else {
      document.documentElement.classList.add("akis-light");
      document.documentElement.classList.remove("akis-dark");
    }
  }

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
      title={isDark ? "Açık Mod" : "Koyu Mod"}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all duration-200 cursor-pointer shrink-0"
    >
      {isDark ? (
        /* Sun icon */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </svg>
      ) : (
        /* Moon icon */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          />
        </svg>
      )}
    </button>
  );
}
