"use client";

import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface ExamEvent {
  id: string;
  date: string;
  title: string;
  committee: string;
  type: "komite" | "pratik" | "final" | "etkinlik";
  time?: string;
  location?: string;
}

interface Props {
  initialEvents: ExamEvent[];
}

export default function TakvimClient({ initialEvents }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  const daysOfWeek = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDateString = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const getCleanDate = (dateStr: string) => (dateStr ? dateStr.split("T")[0] : "");

  const getTypeBadge = (type: ExamEvent["type"]) => {
    switch (type) {
      case "komite": return "bg-amber-400/10 text-amber-300 border-amber-400/20";
      case "pratik": return "bg-sky-400/10 text-sky-300 border-sky-400/20";
      case "final":  return "bg-rose-400/10 text-rose-300 border-rose-400/20";
      case "etkinlik": return "bg-emerald-400/10 text-emerald-300 border-emerald-400/20";
      default: return "bg-white/5 text-neutral-300 border-white/10";
    }
  };

  const filteredEvents = initialEvents.filter((e) => {
    const cleanDate = getCleanDate(e.date);
    if (selectedDate) return cleanDate === selectedDate;
    const ym = `${year}-${String(month + 1).padStart(2, "0")}`;
    return cleanDate.startsWith(ym);
  });

  return (
    <div className="min-h-screen min-h-svh bg-[#070709] text-white font-sans selection:bg-amber-400 selection:text-black flex flex-col justify-between relative overflow-x-hidden">
      {/* Glow Orbs — High performance radial gradient without GPU filter blur */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.15) 0%, rgba(168, 85, 247, 0.1) 40%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle at center, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
        }}
      />

      <div>
        <Header />

        <main className="pb-24 pt-32 relative z-10">
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10">

            {/* BAŞLIK */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/[0.06]">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-medium text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Akademik Takvim</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white/95">Sınav &amp; Komite Programı</h1>
                <p className="text-sm text-neutral-400 font-normal max-w-xl">
                  Komiteler, pratikler ve etkinlikler. Gün gün güncel sınav akışınızı takip edin.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs bg-white/[0.03] p-2.5 px-4 rounded-2xl border border-white/[0.08]">
                {(["Komite","Pratik","Final","Etkinlik"] as const).map((label, i) => {
                  const colors = ["bg-amber-400","bg-sky-400","bg-rose-400","bg-emerald-400"];
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${colors[i]}`} />
                      <span className="text-neutral-300 font-medium text-xs">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TAKVİM + DETAY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* TAKVİM IZGARASI */}
              <div className="lg:col-span-8 bg-white/[0.02] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-white tracking-tight">
                    {monthNames[month]} <span className="text-amber-400 font-semibold">{year}</span>
                  </h2>
                  <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/[0.06]">
                    <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/10 text-neutral-300 transition-all cursor-pointer active:scale-95">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => setSelectedDate(null)} className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-neutral-300 transition-all cursor-pointer active:scale-95">Tüm Ay</button>
                    <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/10 text-neutral-300 transition-all cursor-pointer active:scale-95">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

                {/* Gün İsimleri */}
                <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-medium text-neutral-400 uppercase tracking-wider border-b border-white/[0.06] pb-3">
                  {daysOfWeek.map((d) => <div key={d}>{d}</div>)}
                </div>

                {/* Günler */}
                <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`e-${i}`} className="h-16 sm:h-20 rounded-2xl" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const dateStr = formatDateString(day);
                    const dayEvents = initialEvents.filter((e) => getCleanDate(e.date) === dateStr);
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === new Date().toISOString().split("T")[0];

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`h-16 sm:h-20 p-2 rounded-2xl border flex flex-col justify-between items-start transition-all duration-200 text-left cursor-pointer group active:scale-[0.97] ${
                          isSelected
                            ? "border-amber-400/80 bg-amber-400/10 shadow-lg shadow-amber-400/10"
                            : isToday
                            ? "border-white/20 bg-white/[0.06]"
                            : "border-white/[0.05] bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className={`text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isToday ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/30"
                            : isSelected ? "bg-amber-400/20 text-amber-300"
                            : "text-neutral-400 group-hover:text-white"
                          }`}>
                            {day}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
                          )}
                        </div>
                        <div className="w-full space-y-0.5">
                          {dayEvents.slice(0, 1).map((ev) => (
                            <div key={ev.id} className={`text-[9px] font-medium truncate px-1.5 py-0.5 rounded-lg border ${getTypeBadge(ev.type)}`}>
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 1 && (
                            <span className="text-[9px] text-neutral-400 font-medium pl-1 block">+{dayEvents.length - 1} daha</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DETAY PANELİ */}
              <div className="lg:col-span-4 bg-white/[0.02] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-medium text-white/95">{selectedDate ? "Günlük Program" : "Aylık Akış"}</h3>
                    <p className="text-xs text-neutral-400">{selectedDate ? selectedDate : `${monthNames[month]} ${year}`}</p>
                  </div>
                  {selectedDate && (
                    <button onClick={() => setSelectedDate(null)} className="text-xs text-amber-300 hover:text-amber-200 transition-colors font-medium px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20">
                      Sıfırla
                    </button>
                  )}
                </div>

                <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-none">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-neutral-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-neutral-400 font-normal leading-relaxed max-w-[200px] mx-auto">
                        {selectedDate ? "Seçilen günde tanımlanmış bir sınav veya etkinlik yok." : "Bu ay için henüz eklenmiş program bulunmuyor."}
                      </p>
                    </div>
                  ) : (
                    filteredEvents.map((ev) => (
                      <div key={ev.id} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/20 rounded-2xl p-4 space-y-3 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full border ${getTypeBadge(ev.type)}`}>{ev.type}</span>
                          <span className="text-[11px] font-mono text-neutral-400">{getCleanDate(ev.date)}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white/90 group-hover:text-amber-300 transition-colors">{ev.title}</h4>
                          <p className="text-xs text-neutral-400 mt-1 font-normal">{ev.committee}</p>
                        </div>
                        {(ev.time || ev.location) && (
                          <div className="flex items-center gap-4 text-[11px] text-neutral-400 pt-2.5 border-t border-white/[0.05]">
                            {ev.time && <span className="flex items-center gap-1.5">⏱ {ev.time}</span>}
                            {ev.location && <span className="flex items-center gap-1.5">📍 {ev.location}</span>}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
