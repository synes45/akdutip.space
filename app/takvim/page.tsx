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
        // API Route adresi admindeki çalışan endpoint'e yönlendirildi
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
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "pratik":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "final":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "etkinlik":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
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
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* Üst Header */}
        <Header />

        <main className="pb-20 pt-28">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 space-y-8 relative z-30">
            
            {/* SAYFA BAŞLIĞI VE ÖZET */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400 uppercase tracking-widest mb-1">
                  <span>📅 AKADEMİK TAKVİM</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Sınav & Komite Tarihleri
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                  Komite sınavlarını, pratik sınavları ve önemli duyuruları gün gün takip edin.
                </p>
              </div>

              {/* Tür Gösterge Renkleri */}
              <div className="flex flex-wrap items-center gap-3 text-xs bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="text-neutral-300">Komite</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span className="text-neutral-300">Pratik</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-neutral-300">Etkinlik</span>
                </div>
              </div>
            </div>

            {/* TAKVİM VE DETAY PANELLERİ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* SOL: TAKVİM IZGARASI */}
              <div className="lg:col-span-2 bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                
                {/* Ay ve Yıl Başlığı + Butonlar */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white tracking-wide">
                    {monthNames[month]} <span className="text-yellow-400">{year}</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-all cursor-pointer"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-all cursor-pointer"
                    >
                      Tüm Ay
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-all cursor-pointer"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                {/* Gün İsimleri */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-neutral-400 border-b border-neutral-800 pb-3">
                  {daysOfWeek.map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                {/* Gün Kutu İçerikleri */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Önceki Aydan Kalan Boş Hücreler */}
                  {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-neutral-950/20" />
                  ))}

                  {/* İçinde Bulunulan Ayın Günleri */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const dateStr = formatDateString(day);
                    
                    // Güvenli tarih kontrolü ile eşleştirme
                    const dayEvents = events.filter((e) => getCleanDate(e.date) === dateStr);
                    const isSelected = selectedDate === dateStr;

                    const todayStr = new Date().toISOString().split("T")[0];
                    const isToday = dateStr === todayStr;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between items-start transition-all relative overflow-hidden text-left cursor-pointer group ${
                          isSelected
                            ? "border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/10"
                            : isToday
                            ? "border-blue-500/50 bg-blue-500/5"
                            : "border-neutral-800/80 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-800/40"
                        }`}
                      >
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center ${
                            isToday
                              ? "bg-blue-600 text-white"
                              : isSelected
                              ? "bg-yellow-500 text-black"
                              : "text-neutral-400 group-hover:text-white"
                          }`}
                        >
                          {day}
                        </span>

                        {/* Etkinlik Rozeti (Küçük Görünüm) */}
                        <div className="w-full space-y-1">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              className={`text-[10px] font-medium truncate px-1.5 py-0.5 rounded border ${getTypeBadge(
                                ev.type
                              )}`}
                            >
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[9px] text-neutral-500 pl-1">
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
              <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-6 space-y-5 h-fit shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>📌</span>
                    <span>
                      {selectedDate
                        ? `${selectedDate} Tarihli Program`
                        : `${monthNames[month]} Ayı Programı`}
                    </span>
                  </h3>
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-xs text-yellow-400 hover:underline cursor-pointer"
                    >
                      Temizle
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-10 space-y-2">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent"></div>
                      <p className="text-xs text-neutral-500">Sınav takvimi yükleniyor...</p>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <span className="text-3xl">☕</span>
                      <p className="text-xs text-neutral-500">
                        {selectedDate
                          ? "Bu tarihte planlanmış bir sınav yok."
                          : "Bu ay için henüz sınav eklenmemiş."}
                      </p>
                    </div>
                  ) : (
                    filteredEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 space-y-2 hover:border-neutral-700 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeBadge(
                              ev.type
                            )}`}
                          >
                            {ev.type}
                          </span>
                          <span className="text-xs font-mono text-neutral-400">{getCleanDate(ev.date)}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                          <p className="text-xs text-neutral-400 mt-0.5">{ev.committee}</p>
                        </div>

                        {(ev.time || ev.location) && (
                          <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-2 border-t border-neutral-900">
                            {ev.time && <span>⏰ {ev.time}</span>}
                            {ev.location && <span>📍 {ev.location}</span>}
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