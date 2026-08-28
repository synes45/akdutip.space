"use client";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: "courses" | "calendar" | "members") => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col justify-between shrink-0">
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-black text-yellow-400 tracking-wider flex items-center gap-2">
            <span>⚙️</span> MedStream
          </h1>
          <p className="text-[11px] text-neutral-400 mt-1">Yönetim & Kontrol Paneli</p>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab("courses")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "courses"
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-sm shadow-yellow-500/5"
                : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
            }`}
          >
            📚 Ders ve İçerik Yönetimi
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "calendar"
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-sm shadow-yellow-500/5"
                : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
            }`}
          >
            📅 Etkinlik & Takvim
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "members"
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-sm shadow-yellow-500/5"
                : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
            }`}
          >
            👥 Kullanıcı & Üye Yönetimi
          </button>
        </nav>
      </div>

      <div className="text-[10px] text-neutral-500 border-t border-neutral-800 pt-4 font-mono">
        MedStream Admin v2.0
      </div>
    </aside>
  );
}