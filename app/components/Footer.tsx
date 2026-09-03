"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-10 select-none">
      <div className="w-full px-4 sm:px-8 flex flex-col gap-6">
        
        {/* Üst Kısım: Marka & Linkler */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900/80 pb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-sm text-zinc-100 hover:text-amber-400 transition-colors uppercase tracking-wider">
              AKDENİZ <span className="text-zinc-500 font-normal">TIP</span>
            </Link>
            <span className="text-zinc-800 hidden sm:inline">•</span>
            <span className="text-xs text-zinc-500 hidden sm:inline">Ders & Komite Notları Arşivi</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#committees" className="hover:text-zinc-200 transition-colors">
              Komiteler
            </a>
            <Link href="/dersler" className="hover:text-zinc-200 transition-colors">
              Ders Arşivi
            </Link>
            <Link href="/admin" className="hover:text-amber-400 transition-colors">
              Admin
            </Link>
          </div>
        </div>

        {/* Alt Kısım: Yasal Açıklamalar & Telif */}
        <div className="flex flex-col md:flex-row justify-between gap-4 text-[11px] text-zinc-500 leading-relaxed">
          <div className="max-w-4xl space-y-1.5">
            <p>
              <strong className="text-zinc-400 font-medium">Erişim Kısıtlaması ve Yasal Bilgilendirme:</strong> Bu platformda yer alan ders kayıtları, materyal ve komite notları yalnızca kayıtlı <strong className="text-zinc-400 font-medium">Akdeniz Üniversitesi Tıp Fakültesi</strong> öğrencilerine açıktır.
            </p>
            <p>
              Sitede sunulan içerikler eğitim amaçlı olup ticari amaçla paylaşılamaz, çoğaltılamaz veya üçüncü taraflarla dağıtılamaz. Hesabınızı yetkisiz kişilerle paylaşmanız durumunda erişiminiz kısıtlanabilir.
            </p>
          </div>

          <div className="flex flex-col md:items-end justify-end whitespace-nowrap text-zinc-600">
            <span>© {currentYear} Akdeniz Tıp Arşivi.</span>
            <span>Tüm hakları saklıdır.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}