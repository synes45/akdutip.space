"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Loader from "@/app/components/Loader";

/**
 * Navigasyon sırasında kısa bir yükleme göstergesi sunar.
 * Layout'un "use client" olmadan kalmasını sağlamak için bu bileşene ayrıldı.
 * Yapay 1 saniyelik gecikme kaldırıldı — gerçek navigasyon geçişini izler.
 */
export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setLoading(true);
      // Sayfanın ilk paint'ini engellemeden kısa bir flash göster
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[999] bg-neutral-950 flex items-center justify-center pointer-events-auto">
          <Loader text="Yükleniyor..." />
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-full">
        {children}
      </div>
    </>
  );
}
