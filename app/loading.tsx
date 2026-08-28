// app/loading.tsx
"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";

export default function Loading() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000); // En az 2 saniye sürer

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center">
        <Loader text="MedStream Yükleniyor..." />
      </div>
    </div>
  );
}