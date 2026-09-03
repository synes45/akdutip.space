export default function Hero() {
  return (
    <section className="relative w-full bg-zinc-955 pt-36 sm:pt-94 pb-0 overflow-hidden border-b-0">
      
      {/* Arka Plan Görseli */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1920&auto=format&fit=crop')" 
        }} 
      />

      {/* Ortada Başlayan Dengeli Gölge Katmanı */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950 pointer-events-none" />

      {/* İçerik Alanı */}
      <div className="relative z-10 w-full px-4 sm:px-8">
        <div className="max-w-3xl space-y-3 text-left">
          
          {/* Üst Rozet */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-medium text-amber-400 shadow-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Akdeniz Tıp Ders Arşivi</span>
          </div>

          {/* Ana Başlık */}
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Komite Notları ve <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Ders Kayıtları
            </span>
          </h1>

          {/* Alt Metin */}
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg font-normal leading-relaxed">
            Telegram'da kaybolan videoları ve sürücülerde aranan notları tek adreste topladık. Komiteni seç, kaydını izle ve kesintisiz çalış.
          </p>

        </div>
      </div>
    </section>
  );
}