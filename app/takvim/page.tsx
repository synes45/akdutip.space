"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface ExamEvent {
  id: string;
  date: string;
  title: string;
  committee: string;
  type: "komite" | "pratik" | "final" | "etkinlik";
  time?: string;
  location?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<ExamEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error("API Response hatası:", response.status);
        }
      } catch (error) {
        console.error("Veritabanından sınav verileri çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const daysOfWeek = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDateString = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const getTypeBadge = (type: ExamEvent["type"]) => {
    switch (type) {
      case "komite":
        return "bg-amber-400/10 text-amber-300 border-amber-400/20";
      case "pratik":
        return "bg-sky-400/10 text-sky-300 border-sky-400/20";
      case "final":
        return "bg-rose-400/10 text-rose-300 border-rose-400/20";
      case "etkinlik":
        return "bg-emerald-400/10 text-emerald-300 border-emerald-400/20";
      default:
        return "bg-white/5 text-neutral-300 border-white/10";
    }
  };

  const getCleanDate = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };

  const filteredEvents = events.filter((e) => {
    const cleanEventDate = getCleanDate(e.date);
    if (selectedDate) return cleanEventDate === selectedDate;
    const currentYearMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
    return cleanEventDate.startsWith(currentYearMonth);
  });

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans selection:bg-amber-400 selection:text-black flex flex-col justify-between relative overflow-hidden">
      
      {/* iOS Stili Arka Plan Işık Efektleri (Glow Orbs) */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-amber-500/10 via-purple-500/10 to-blue-500/10 blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute top-1/2 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full" />

      <div>
        <Header />

        <main className="pb-24 pt-32 relative z-10">
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10">
            
            {/* SAYFA BAŞLIĞI VE SADE KATEGORİ LİSTESİ */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/[0.06]">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-medium text-amber-300 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Akademik Takvim</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white/95">
                  Sınav & Komite Programı
                </h1>
                <p className="text-sm text-neutral-400 font-normal max-w-xl">
                  Komiteler, pratikler ve etkinlikler. Gün gün güncel sınav akışınızı takip edin.
                </p>
              </div>

              {/* Minimalist Gösterge Rozetleri */}
              <div className="flex flex-wrap items-center gap-3 text-xs bg-white/[0.03] backdrop-blur-2xl p-2.5 px-4 rounded-2xl border border-white/[0.08] shadow-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                  <span className="text-neutral-300 font-medium text-xs">Komite</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
                  <span className="text-neutral-300 font-medium text-xs">Pratik</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />
                  <span className="text-neutral-300 font-medium text-xs">Final</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span className="text-neutral-300 font-medium text-xs">Etkinlik</span>
                </div>
              </div>
            </div>

            {/* TAKVİM VE EKRAN DÜZENİ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* SOL: TAKVİM IZGARASI (GLASS CARD) */}
              <div className="lg:col-span-8 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                
                {/* Header / Ay Geçişleri */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-white tracking-tight">
                    {monthNames[month]} <span className="text-amber-400 font-semibold">{year}</span>
                  </h2>

                  <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/[0.06] backdrop-blur-xl">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-xl hover:bg-white/10 text-neutral-300 transition-all cursor-pointer active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-xs font-medium text-neutral-300 transition-all cursor-pointer active:scale-95"
                    >
                      Tüm Ay
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-xl hover:bg-white/10 text-neutral-300 transition-all cursor-pointer active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Gün İsimleri */}
                <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-medium text-neutral-400 uppercase tracking-wider border-b border-white/[0.06] pb-3">
                  {daysOfWeek.map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                {/* Gün Hücreleri */}
                <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
                  {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-2xl bg-transparent" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const dateStr = formatDateString(day);
                    const dayEvents = events.filter((e) => getCleanDate(e.date) === dateStr);
                    const isSelected = selectedDate === dateStr;
                    const todayStr = new Date().toISOString().split("T")[0];
                    const isToday = dateStr === todayStr;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`h-20 sm:h-24 p-2.5 rounded-2xl border flex flex-col justify-between items-start transition-all duration-300 relative text-left cursor-pointer group active:scale-[0.98] ${
                          isSelected
                            ? "border-amber-400/80 bg-amber-400/10 shadow-lg shadow-amber-400/10 backdrop-blur-xl"
                            : isToday
                            ? "border-white/20 bg-white/[0.06]"
                            : "border-white/[0.05] bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span
                            className={`text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              isToday
                                ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/30"
                                : isSelected
                                ? "bg-amber-400/20 text-amber-300"
                                : "text-neutral-400 group-hover:text-white"
                            }`}
                          >
                            {day}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
                          )}
                        </div>

                        {/* Etkinlik Mini Rozetleri */}
                        <div className="w-full space-y-1">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              className={`text-[9px] font-medium truncate px-1.5 py-0.5 rounded-lg border backdrop-blur-md ${getTypeBadge(
                                ev.type
                              )}`}
                            >
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[9px] text-neutral-400 font-medium pl-1 block">
                              +{dayEvents.length - 2} daha
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SAĞ: DETAY PANELLERİ (MINIMALIST GLASS) */}
              <div className="lg:col-span-4 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-medium text-white/95">
                      {selectedDate ? "Günlük Program" : "Aylık Akış"}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {selectedDate ? selectedDate : `${monthNames[month]} ${year}`}
                    </p>
                  </div>
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-xs text-amber-300 hover:text-amber-200 transition-colors font-medium px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                {/* Liste İçeriği */}
                <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                  {loading ? (
                    <div className="text-center py-16 space-y-3">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-amber-400 border-t-transparent" />
                      <p className="text-xs text-neutral-400 font-medium">Sınavlar yükleniyor...</p>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-neutral-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-neutral-400 font-normal leading-relaxed max-w-[200px] mx-auto">
                        {selectedDate
                          ? "Seçilen günde tanımlanmış bir sınav veya etkinlik yok."
                          : "Bu ay için henüz eklenmiş program bulunmuyor."}
                      </p>
                    </div>
                  ) : (
                    filteredEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/20 rounded-2xl p-4 space-y-3 transition-all duration-300 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full border backdrop-blur-md ${getTypeBadge(
                              ev.type
                            )}`}
                          >
                            {ev.type}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400 font-medium">
                            {getCleanDate(ev.date)}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-white/90 group-hover:text-amber-300 transition-colors">
                            {ev.title}
                          </h4>
                          <p className="text-xs text-neutral-400 mt-1 font-normal">{ev.committee}</p>
                        </div>

                        {(ev.time || ev.location) && (
                          <div className="flex items-center gap-4 text-[11px] text-neutral-400 pt-2.5 border-t border-white/[0.05]">
                            {ev.time && (
                              <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {ev.time}
                              </span>
                            )}
                            {ev.location && (
                              <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {ev.location}
                              </span>
                            )}
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