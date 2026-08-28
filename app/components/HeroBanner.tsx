export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-neutral-950 px-4 py-20">
      
      {/* 👨‍⚕️ 1. Arka Plan Görseli */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1920&auto=format&fit=crop')" 
        }} 
      />

      {/* 🏁 2. Üstüne Grid Deseni */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* 🌑 3. Aşağıya Doğru Siyahlaşma Maskesi */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-neutral-950/70 to-neutral-950 pointer-events-none" />

      {/* ✍️ 4. İçerik (Daha Geniş Boşluklar) */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8 my-auto">
        
        {/* Üst Rozet */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs font-medium text-yellow-400 backdrop-blur-sm">
            <span>📂</span> Akdeniz Tıp Ders Arşivi
          </div>
        </div>

        {/* Ana Başlık */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Komite Notları ve <br />
          <span className="text-yellow-400">Ders Kayıtları</span>
        </h1>

        {/* Alt Metin */}
        <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto font-normal leading-relaxed">
          Telegram'da kaybolan videoları, drive'larda aranan notları tek yere topladık. Komiteni seç, kaydını izle, dersine çalış.
        </p>

        {/* Butonlar */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <a
            href="#committees"
            className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-all active:scale-95"
          >
            Komiteler
          </a>
          <a
            href="/dersler"
            className="px-6 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-800 font-semibold text-sm transition-all backdrop-blur-sm active:scale-95"
          >
            Tüm Dersler
          </a>
        </div>

      </div>
    </section>
  );
}