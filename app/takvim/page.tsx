"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface ExamEvent {
  id: string;
  date: string; // YYYY-MM-DD veya ISO string
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

  // Veritabanından (API Endpoint üzerinden) Etkinlik Verilerini Çekme
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

  // Takvim Hesaplamaları
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const daysOfWeek = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  // Ayın ilk gününün indexini alma (Pazartesi ile başlaması için adapte edildi)
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Ay Navigasyonu
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Tarih Formatlayıcı (YYYY-MM-DD)
  const formatDateString = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  // Tür Rozet Renkleri
  const getTypeBadge = (type: ExamEvent["type"]) => {
    switch (type) {
      case "komite":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
      case "pratik":
        return "bg-blue-500/10 text-blue-400 border-blue-500/25";
      case "final":
        return "bg-red-500/10 text-red-400 border-red-500/25";
      case "etkinlik":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  // Güvenli Tarih Yardımcısı (Saat/ISO takısını temizler: "2026-08-04T00..." -> "2026-08-04")
  const getCleanDate = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };

  // Sınav / Etkinlik Filtreleme
  const filteredEvents = events.filter((e) => {
    const cleanEventDate = getCleanDate(e.date);

    if (selectedDate) return cleanEventDate === selectedDate;

    const currentYearMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
    return cleanEventDate.startsWith(currentYearMonth);
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-yellow-500 selection:text-black flex flex-col justify-between">
      <div>
        {/* Üst Header */}
        <Header />

        <main className="pb-20 pt-28">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 space-y-8 relative z-30">
            
            {/* SAYFA BAŞLIĞI VE ÖZET */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1.5">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>AKADEMİK TAKVİM</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Sınav & Komite Tarihleri
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                  Komite sınavlarını, pratik sınavları ve önemli duyuruları gün gün takip edin.
                </p>
              </div>

              {/* Tür Gösterge Renkleri */}
              <div className="flex flex-wrap items-center gap-4 text-xs bg-neutral-900/40 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-900 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm shadow-yellow-500/20" />
                  <span className="text-neutral-300 font-semibold">Komite</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-500/20" />
                  <span className="text-neutral-300 font-semibold">Pratik</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/20" />
                  <span className="text-neutral-300 font-semibold">Etkinlik</span>
                </div>
              </div>
            </div>

            {/* TAKVİM VE DETAY PANELLERİ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* SOL: TAKVİM IZGARASI */}
              <div className="lg:col-span-2 bg-neutral-900/40 backdrop-blur-md border border-neutral-900 rounded-2xl p-6 space-y-6 shadow-xl">
                
                {/* Ay ve Yıl Başlığı + Butonlar */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white tracking-wide">
                    {monthNames[month]} <span className="text-yellow-500">{year}</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-300 transition-all cursor-pointer"
                    >
                      Tüm Ay
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Gün İsimleri */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-neutral-400 border-b border-neutral-900 pb-3">
                  {daysOfWeek.map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                {/* Gün Kutu İçerikleri */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Önceki Aydan Kalan Boş Hücreler */}
                  {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-neutral-950/20 border border-transparent" />
                  ))}

                  {/* İçinde Bulunulan Ayın Günleri */}
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
                        className={`h-16 sm:h-20 p-2 rounded-xl border flex flex-col justify-between items-start transition-all relative overflow-hidden text-left cursor-pointer group ${
                          isSelected
                            ? "border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/5"
                            : isToday
                            ? "border-yellow-500/40 bg-yellow-500/5"
                            : "border-neutral-900 bg-neutral-950/40 hover:border-neutral-800 hover:bg-neutral-900/60"
                        }`}
                      >
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            isToday
                              ? "bg-yellow-500 text-black font-extrabold"
                              : isSelected
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "text-neutral-400 group-hover:text-white"
                          }`}
                        >
                          {day}
                        </span>

                        {/* Etkinlik Rozeti (Küçük Görünüm) */}
                        <div className="w-full space-y-1 mt-1">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              className={`text-[9px] font-bold truncate px-1.5 py-0.5 rounded border ${getTypeBadge(
                                ev.type
                              )}`}
                            >
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[9px] text-neutral-500 pl-1 font-bold">
                              +{dayEvents.length - 2} daha
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SAĞ: DETAYLI SINAV LİSTESİ */}
              <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-900 rounded-2xl p-6 space-y-5 h-fit shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span>
                      {selectedDate
                        ? `${selectedDate} Programı`
                        : `${monthNames[month]} Ayı Programı`}
                    </span>
                  </h3>
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-xs text-yellow-500 hover:underline cursor-pointer font-bold"
                    >
                      Temizle
                    </button>
                  )}
                </div>

                <div className="space-y-3.5">
                  {loading ? (
                    <div className="text-center py-10 space-y-2">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent"></div>
                      <p className="text-xs text-neutral-500 font-bold">Yükleniyor...</p>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <svg className="w-8 h-8 text-neutral-700 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                        {selectedDate
                          ? "Bu tarihte planlanmış bir sınav bulunamadı."
                          : "Bu ay için henüz sınav eklenmemiş."}
                      </p>
                    </div>
                  ) : (
                    filteredEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-neutral-950/60 border border-neutral-900 rounded-xl p-4.5 space-y-2.5 hover:border-neutral-800 transition-all shadow-inner"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getTypeBadge(
                              ev.type
                            )}`}
                          >
                            {ev.type}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 font-bold">{getCleanDate(ev.date)}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                          <p className="text-xs text-neutral-400 mt-0.5">{ev.committee}</p>
                        </div>

                        {(ev.time || ev.location) && (
                          <div className="flex items-center gap-4 text-[10px] text-neutral-500 pt-2 border-t border-neutral-900/60">
                            {ev.time && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {ev.time}
                              </span>
                            )}
                            {ev.location && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      {/* Modern Alt Footer */}
      <Footer />
    </div>
  );
}