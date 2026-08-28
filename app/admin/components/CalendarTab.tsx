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

  // Tür Rozet Renkleri
  const getTypeBadge = (eventType: ExamEvent["type"]) => {
    switch (eventType) {
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
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-white">Akademik Takvim & Sınav Yönetimi</h2>
        <p className="text-xs text-neutral-400 mt-1">
          Öğrencilerin takvim sayfasında göreceği sınavları, pratikleri ve duyuruları buradan ekleyebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL: ETKİNLİK / SINAV EKLEME FORMU */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-4 h-fit">
          <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
            ➕ Yeni Sınav / Etkinlik Ekle
          </h3>

          <form onSubmit={handleAddEvent} className="space-y-3">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Etkinlik Türü</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ExamEvent["type"])}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="komite">Komite Sınavı</option>
                <option value="pratik">Pratik Sınav</option>
                <option value="final">Final Sınavı</option>
                <option value="etkinlik">Etkinlik / Duyuru</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Başlık</label>
              <input
                type="text"
                placeholder="Örn: 1. Komite Teorik Sınavı"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg focus:outline-none focus:border-yellow-500 text-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Komite / Ders Adı</label>
              <input
                type="text"
                placeholder="Örn: Tıbbi Bilimlere Giriş"
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg focus:outline-none focus:border-yellow-500 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Tarih</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Saat (Opsiyonel)</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Mekan / Amfi (Opsiyonel)</label>
              <input
                type="text"
                placeholder="Örn: Amfi 1 veya Anatomi Lab"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg focus:outline-none focus:border-yellow-500 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow-500 text-black py-2.5 rounded-lg text-xs font-bold hover:bg-yellow-400 transition-all mt-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Ekleniyor..." : "Takvime Ekle"}
            </button>
          </form>
        </div>

        {/* SAĞ: MEVCUT ETKİNLİKLER LİSTESİ */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              📅 Yayındaki Takvim Etkinlikleri ({events.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-neutral-500 text-center py-8">Yükleniyor...</p>
            ) : events.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-8">Henüz takvime eklenmiş bir etkinlik yok.</p>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-neutral-700 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeBadge(
                          ev.type
                        )}`}
                      >
                        {ev.type}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">📅 {ev.date}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">{ev.committee}</p>
                    </div>

                    {(ev.time || ev.location) && (
                      <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-1">
                        {ev.time && <span>⏰ {ev.time}</span>}
                        {ev.location && <span>📍 {ev.location}</span>}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="text-xs text-neutral-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                    title="Etkinliği Sil"
                  >
                    🗑️ Sil
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