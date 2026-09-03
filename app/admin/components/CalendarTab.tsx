"use client";

import { useState, useEffect } from "react";

export interface ExamEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  committee: string;
  type: "komite" | "pratik" | "final" | "etkinlik";
  time?: string | null;
  location?: string | null;
}

export default function CalendarTab() {
  const [events, setEvents] = useState<ExamEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State'leri
  const [title, setTitle] = useState("");
  const [committee, setCommittee] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<ExamEvent["type"]>("komite");

  // Etkinlikleri Veritabanından Çek
const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Etkinlikler yüklenirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Tür Rozet stilleri (Cam dokulu ve minimal)
  const getTypeBadge = (eventType: ExamEvent["type"]) => {
    switch (eventType) {
      case "komite":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "pratik":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "final":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "etkinlik":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-zinc-800/50 text-zinc-400 border-white/5";
    }
  };

  // Yeni Etkinlik Ekleme (POST)
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !committee) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          committee,
          date,
          time: time || undefined,
          location: location || undefined,
          type,
        }),
      });

      if (res.ok) {
        const createdEvent = await res.json();
        setEvents((prev) => [createdEvent, ...prev]);

        // Formu Temizle
        setTitle("");
        setCommittee("");
        setDate("");
        setTime("");
        setLocation("");
        setType("komite");
      } else {
        alert("Etkinlik eklenirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Ekleme hatası:", error);
      alert("Sunucuyla iletişim kurulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  // Etkinlik Silme (DELETE)
  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Bu etkinliği takvimden silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert("Silme işlemi başarısız oldu.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Sunucuyla iletişim kurulamadı.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl font-sans text-zinc-100">
      {/* Üst Başlık & Konfigürasyon Kartı */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Akademik Takvim & Sınav Yönetimi
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Öğrencilerin takvim sayfasında göreceği sınavları, pratikleri ve duyuruları yönetin.
          </p>
        </div>
        <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          {events.length} Kayıtlı Etkinlik
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL: ETKİNLİK / SINAV EKLEME FORMU */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-4 h-fit shadow-2xl">
          <h3 className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>01.</span> Yeni Etkinlik / Sınav
          </h3>

          <form onSubmit={handleAddEvent} className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Etkinlik Türü</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ExamEvent["type"])}
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white focus:outline-none focus:border-amber-400/50 transition"
              >
                <option value="komite" className="bg-zinc-900">Komite Sınavı</option>
                <option value="pratik" className="bg-zinc-900">Pratik Sınav</option>
                <option value="final" className="bg-zinc-900">Final Sınavı</option>
                <option value="etkinlik" className="bg-zinc-900">Etkinlik / Duyuru</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Başlık</label>
              <input
                type="text"
                placeholder="Örn: 1. Komite Teorik Sınavı"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Komite / Ders Adı</label>
              <input
                type="text"
                placeholder="Örn: Tıbbi Bilimlere Giriş"
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Tarih</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white focus:outline-none focus:border-amber-400/50 transition"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Saat (Opsiyonel)</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Mekan / Amfi (Opsiyonel)</label>
              <input
                type="text"
                placeholder="Örn: Amfi 1 veya Anatomi Lab"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white/5 border border-white/10 text-zinc-200 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/10 hover:text-white transition active:scale-[0.98] disabled:opacity-40 mt-2"
            >
              {submitting ? "Ekleniyor..." : "Takvime İşle"}
            </button>
          </form>
        </div>

        {/* SAĞ: MEVCUT ETKİNLİKLER LİSTESİ */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
              Yayındaki Takvim Etkinlikleri ({events.length})
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">REALTIME</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs font-mono text-zinc-500 text-center py-12">Yükleniyor...</p>
            ) : events.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 text-center py-12">
                Henüz takvime eklenmiş bir etkinlik bulunmuyor.
              </p>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-4 hover:border-white/10 transition"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeBadge(
                          ev.type
                        )}`}
                      >
                        {ev.type}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        {ev.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">{ev.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{ev.committee}</p>
                    </div>

                    {(ev.time || ev.location) && (
                      <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 pt-1">
                        {ev.time && <span>⏰ {ev.time}</span>}
                        {ev.location && <span>📍 {ev.location}</span>}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="text-xs text-zinc-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                    title="Etkinliği Sil"
                  >
                    Sil
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}