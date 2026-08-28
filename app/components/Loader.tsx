export default function Loader({ text = "Yükleniyor..." }: { text?: string }) {
  return (
    <div className="min-h-[60vh] bg-neutral-950 flex flex-col items-center justify-center gap-4">
      {/* Şık Dönen Neon Spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-neutral-800"></div>
        <div className="absolute inset-0 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin"></div>
      </div>
      
      {/* Altındaki Metin */}
      <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase animate-pulse">
        {text}
      </p>
    </div>
  );
}