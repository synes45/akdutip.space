"use client";

import { useState, useEffect } from "react";

interface Video { id: string; title: string; telegramId: string; pdfUrl?: string; order?: number; }
interface Lesson { id: string; name: string; videos: Video[]; }
interface Committee { id: string; title: string; subtitle: string; bgImage?: string; lessons: Lesson[]; }

export default function CoursesTab() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  // Edit / Form State'leri
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [commTitle, setCommTitle] = useState("");
  const [commSubtitle, setCommSubtitle] = useState("");
  const [commBg, setCommBg] = useState("");
  const [lessonName, setLessonName] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCommittees(data);
        if (data.length > 0 && !selectedCommitteeId) setSelectedCommitteeId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const resetVideoForm = () => {
    setVideoTitle(""); setTelegramId(""); setPdfUrl(""); setEditingVideoId(null);
  };

  const handleAddCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "committee", title: commTitle, subtitle: commSubtitle, bgImage: commBg }),
    });
    if (res.ok) { setCommTitle(""); setCommSubtitle(""); setCommBg(""); fetchCourses(); }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommitteeId) return;
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "lesson", committeeId: selectedCommitteeId, lessonName }),
    });
    if (res.ok) { setLessonName(""); fetchCourses(); }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonId) return;
    const method = editingVideoId ? "PUT" : "POST";
    const res = await fetch("/api/admin/courses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "video", videoId: editingVideoId, lessonId: selectedLessonId, videoTitle, telegramId, pdfUrl }),
    });
    if (res.ok) { resetVideoForm(); fetchCourses(); }
  };

  const startEditVideo = (lessonId: string, video: Video) => {
    setSelectedLessonId(lessonId);
    setEditingVideoId(video.id);
    setVideoTitle(video.title);
    setTelegramId(video.telegramId);
    setPdfUrl(video.pdfUrl || "");
  };

  const handleMoveVideo = async (lessonId: string, videoId: string, direction: "up" | "down") => {
    await fetch("/api/admin/courses/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, videoId, direction }),
    });
    fetchCourses();
  };

  const handleDelete = async (type: "committee" | "lesson" | "video", id: string) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/courses?${type}Id=${id}`, { method: "DELETE" });
    fetchCourses();
  };

  const selectedCommittee = committees.find((c) => c.id === selectedCommitteeId);

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h2 className="text-xl font-bold text-white">Ders ve İçerik Yönetimi</h2>
        <p className="text-xs text-neutral-400 mt-1">Komiteleri, dersleri, PDF notlarını ve videoları yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL: FORMLAR */}
        <div className="space-y-5">
          {/* Komite Ekle */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-yellow-400 uppercase">1. Komite Ekle</h3>
            <form onSubmit={handleAddCommittee} className="space-y-2">
              <input type="text" placeholder="Başlık" value={commTitle} onChange={(e) => setCommTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg" required />
              <input type="text" placeholder="Alt Başlık" value={commSubtitle} onChange={(e) => setCommSubtitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg" required />
              <input type="text" placeholder="Görsel URL" value={commBg} onChange={(e) => setCommBg(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg" />
              <button type="submit" className="w-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 py-2 rounded-lg text-xs font-bold hover:bg-yellow-500 hover:text-black transition-all">Komiteyi Kaydet</button>
            </form>
          </div>

          {/* Ders Ekle */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-yellow-400 uppercase">2. Ders Ekle</h3>
            <form onSubmit={handleAddLesson} className="space-y-2">
              <select value={selectedCommitteeId} onChange={(e) => setSelectedCommitteeId(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg text-white">
                {committees.map((c) => (<option key={c.id} value={c.id}>{c.title} - {c.subtitle}</option>))}
              </select>
              <input type="text" placeholder="Ders Adı" value={lessonName} onChange={(e) => setLessonName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg" required />
              <button type="submit" disabled={!selectedCommitteeId} className="w-full bg-yellow-500 text-black py-2 rounded-lg text-xs font-bold hover:bg-yellow-400 transition-all disabled:opacity-50">Dersi Ekle</button>
            </form>
          </div>

          {/* Video Ekle */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-yellow-400 uppercase">{editingVideoId ? "✏️ Videoyu Düzenle" : "3. Video & PDF Ekle"}</h3>
              {editingVideoId && <button onClick={resetVideoForm} className="text-[10px] text-neutral-400">İptal</button>}
            </div>
            <form onSubmit={handleSaveVideo} className="space-y-2">
              <select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg text-white" disabled={!!editingVideoId}>
                <option value="">-- Önce Ders Seçin --</option>
                {selectedCommittee?.lessons.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
              </select>
              <input type="text" placeholder="Video Başlığı" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg" required />
              <input type="text" placeholder="Telegram ID" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg" required />
              <input type="text" placeholder="PDF URL" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs rounded-lg" />
              <button type="submit" disabled={!selectedLessonId} className={`w-full text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${editingVideoId ? "bg-emerald-600" : "bg-blue-600"}`}>{editingVideoId ? "Kaydet" : "Videoyu Ekle"}</button>
            </form>
          </div>
        </div>

        {/* SAĞ: LİSTE */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-6">
          <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-3">📋 Yüklü Komiteler ve İçerik Listesi</h3>
          <div className="space-y-4">
            {committees.map((comm) => (
              <div key={comm.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
                  <div className="flex items-center gap-3">
                    {comm.bgImage ? <img src={comm.bgImage} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-500">Yok</div>}
                    <div>
                      <span className="text-yellow-400 font-bold text-xs uppercase">{comm.title}</span>
                      <h4 className="text-sm font-semibold text-white">{comm.subtitle}</h4>
                    </div>
                  </div>
                  <button onClick={() => handleDelete("committee", comm.id)} className="text-xs text-red-500 hover:underline">Komiteyi Sil</button>
                </div>

                <div className="pl-2 space-y-2">
                  {comm.lessons.map((lesson) => (
                    <div key={lesson.id} className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-200">📚 {lesson.name}</span>
                        <button onClick={() => handleDelete("lesson", lesson.id)} className="text-[10px] text-red-400 hover:underline">Dersi Sil</button>
                      </div>

                      <div className="space-y-1 pl-3 border-l-2 border-neutral-800">
                        {lesson.videos.map((vid, idx) => (
                          <div key={vid.id} className="flex items-center justify-between text-[11px] text-neutral-400 bg-neutral-950/60 p-2 rounded-lg">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="flex flex-col gap-0.5">
                                <button disabled={idx === 0} onClick={() => handleMoveVideo(lesson.id, vid.id, "up")} className="text-[9px]">▲</button>
                                <button disabled={idx === lesson.videos.length - 1} onClick={() => handleMoveVideo(lesson.id, vid.id, "down")} className="text-[9px]">▼</button>
                              </div>
                              <span className="truncate">▶️ <strong className="text-neutral-200">{vid.title}</strong></span>
                              {vid.pdfUrl && <span className="bg-red-500/10 text-red-400 text-[9px] px-1 py-0.5 rounded">PDF</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => startEditVideo(lesson.id, vid)} className="text-yellow-400 text-[10px]">Düzenle</button>
                              <button onClick={() => handleDelete("video", vid.id)} className="text-red-400 text-[10px]">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}