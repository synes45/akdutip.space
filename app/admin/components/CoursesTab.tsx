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
  const [editingCommitteeId, setEditingCommitteeId] = useState<string | null>(null);
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

  const resetCommitteeForm = () => {
    setCommTitle("");
    setCommSubtitle("");
    setCommBg("");
    setEditingCommitteeId(null);
  };

  const resetVideoForm = () => {
    setVideoTitle(""); 
    setTelegramId(""); 
    setPdfUrl(""); 
    setEditingVideoId(null);
  };

  // Komite Kaydet (Ekleme / Güncelleme)
  const handleSaveCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCommitteeId ? "PUT" : "POST";
    
    const res = await fetch("/api/admin/courses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        type: "committee", 
        committeeId: editingCommitteeId,
        title: commTitle, 
        subtitle: commSubtitle, 
        bgImage: commBg 
      }),
    });

    if (res.ok) { 
      resetCommitteeForm(); 
      fetchCourses(); 
    }
  };

  const startEditCommittee = (comm: Committee) => {
    setEditingCommitteeId(comm.id);
    setCommTitle(comm.title);
    setCommSubtitle(comm.subtitle);
    setCommBg(comm.bgImage || "");
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
    <div className="space-y-8 max-w-7xl font-sans text-zinc-100">
      {/* Üst Başlık & Konfigürasyon Kartı */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Ders & İçerik Yönetimi
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Komiteleri düzenleyin, müfredata yeni dersler ve Telegram yayın videoları ekleyin.
          </p>
        </div>
        <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          {committees.length} Aktif Komite
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL: DİNAMİK FORM KATMANI */}
        <div className="space-y-5">
          {/* 1. KOMİTE EKLE / DÜZENLE */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>{editingCommitteeId ? "✏️" : "01."}</span>
                {editingCommitteeId ? "Komite Düzenle" : "Komite Ekle"}
              </h3>
              {editingCommitteeId && (
                <button onClick={resetCommitteeForm} className="text-[10px] font-mono text-zinc-400 hover:text-white transition">İptal</button>
              )}
            </div>
            <form onSubmit={handleSaveCommittee} className="space-y-2.5">
              <input 
                type="text" 
                placeholder="Başlık (Örn: 1. KOMİTE)" 
                value={commTitle} 
                onChange={(e) => setCommTitle(e.target.value)} 
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition" 
                required 
              />
              <input 
                type="text" 
                placeholder="Alt Başlık (Örn: Tıbbi Bilimlere Giriş)" 
                value={commSubtitle} 
                onChange={(e) => setCommSubtitle(e.target.value)} 
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition" 
                required 
              />
              <input 
                type="text" 
                placeholder="Görsel URL" 
                value={commBg} 
                onChange={(e) => setCommBg(e.target.value)} 
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition" 
              />
              <button 
                type="submit" 
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                  editingCommitteeId 
                    ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/10" 
                    : "bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                {editingCommitteeId ? "Komiteyi Güncelle" : "Komite Oluştur"}
              </button>
            </form>
          </div>

          {/* 2. DERS EKLE */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-3.5 shadow-2xl">
            <h3 className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">02. Ders Ekle</h3>
            <form onSubmit={handleAddLesson} className="space-y-2.5">
              <select 
                value={selectedCommitteeId} 
                onChange={(e) => setSelectedCommitteeId(e.target.value)} 
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white focus:outline-none focus:border-amber-400/50 transition"
              >
                {committees.map((c) => (<option key={c.id} value={c.id} className="bg-zinc-900 text-white">{c.title} - {c.subtitle}</option>))}
              </select>
              <input 
                type="text" 
                placeholder="Ders Adı (Örn: Anatomi)" 
                value={lessonName} 
                onChange={(e) => setLessonName(e.target.value)} 
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition" 
                required 
              />
              <button 
                type="submit" 
                disabled={!selectedCommitteeId} 
                className="w-full bg-white/5 border border-white/10 text-zinc-200 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/10 hover:text-white transition active:scale-[0.98] disabled:opacity-40"
              >
                Dersi Ekle
              </button>
            </form>
          </div>

          {/* 3. VİDEO & PDF EKLE */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
                {editingVideoId ? "✏️ Video Düzenle" : "03. Video & PDF Ekle"}
              </h3>
              {editingVideoId && <button onClick={resetVideoForm} className="text-[10px] font-mono text-zinc-400 hover:text-white transition">İptal</button>}
            </div>
            <form onSubmit={handleSaveVideo} className="space-y-2.5">
              <select 
                value={selectedLessonId} 
                onChange={(e) => setSelectedLessonId(e.target.value)} 
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white focus:outline-none focus:border-amber-400/50 transition" 
                disabled={!!editingVideoId}
              >
                <option value="" className="bg-zinc-900">-- Önce Ders Seçin --</option>
                {selectedCommittee?.lessons.map((l) => (<option key={l.id} value={l.id} className="bg-zinc-900 text-white">{l.name}</option>))}
              </select>
              <input 
                type="text" 
                placeholder="Video Başlığı" 
                value={videoTitle} 
                onChange={(e) => setVideoTitle(e.target.value)} 
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition" 
                required 
              />
              <input 
                type="text" 
                placeholder="Telegram ID" 
                value={telegramId} 
                onChange={(e) => setTelegramId(e.target.value)} 
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition" 
                required 
              />
              <input 
                type="text" 
                placeholder="PDF Not URL (Opsiyonel)" 
                value={pdfUrl} 
                onChange={(e) => setPdfUrl(e.target.value)} 
                className="w-full bg-zinc-950/60 border border-white/10 p-2.5 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition" 
              />
              <button 
                type="submit" 
                disabled={!selectedLessonId} 
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] disabled:opacity-40 ${
                  editingVideoId 
                    ? "bg-amber-400 text-black font-bold" 
                    : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                }`}
              >
                {editingVideoId ? "Kaydet" : "Videoyu Yayınla"}
              </button>
            </form>
          </div>
        </div>

        {/* SAĞ: CAM KATMANLI HİYERARŞİK İÇERİK LİSTESİ */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
              İçerik Hiyerarşisi
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">LIVE SYNC</span>
          </div>

          <div className="space-y-4">
            {committees.map((comm) => (
              <div key={comm.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-3">
                    {comm.bgImage ? (
                      <img src={comm.bgImage} className="w-9 h-9 rounded-lg object-cover border border-white/10" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-mono text-zinc-600">N/A</div>
                    )}
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">{comm.title}</span>
                      <h4 className="text-xs font-bold text-white">{comm.subtitle}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => startEditCommittee(comm)} className="text-[11px] font-medium text-amber-400/90 hover:text-amber-300 transition">Düzenle</button>
                    <button onClick={() => handleDelete("committee", comm.id)} className="text-[11px] font-medium text-red-400/80 hover:text-red-300 transition">Sil</button>
                  </div>
                </div>

                <div className="pl-1 space-y-2">
                  {comm.lessons.map((lesson) => (
                    <div key={lesson.id} className="p-3 rounded-lg bg-zinc-950/40 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                          {lesson.name}
                        </span>
                        <button onClick={() => handleDelete("lesson", lesson.id)} className="text-[10px] font-mono text-red-400/70 hover:text-red-300 transition">Dersi Sil</button>
                      </div>

                      <div className="space-y-1.5 pl-3 border-l border-white/10">
                        {lesson.videos.map((vid, idx) => (
                          <div key={vid.id} className="flex items-center justify-between text-xs text-zinc-400 bg-white/[0.02] border border-white/5 p-2 rounded-lg hover:border-white/10 transition">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="flex flex-col gap-0.5 text-zinc-500">
                                <button disabled={idx === 0} onClick={() => handleMoveVideo(lesson.id, vid.id, "up")} className="text-[8px] hover:text-white disabled:opacity-20 transition">▲</button>
                                <button disabled={idx === lesson.videos.length - 1} onClick={() => handleMoveVideo(lesson.id, vid.id, "down")} className="text-[8px] hover:text-white disabled:opacity-20 transition">▼</button>
                              </div>
                              <span className="truncate text-zinc-200 font-medium text-xs">{vid.title}</span>
                              {vid.pdfUrl && <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">PDF</span>}
                            </div>
                            <div className="flex items-center gap-2.5">
                              <button onClick={() => startEditVideo(lesson.id, vid)} className="text-[10px] font-medium text-amber-400/90 hover:text-amber-300 transition">Düzenle</button>
                              <button onClick={() => handleDelete("video", vid.id)} className="text-[10px] font-mono text-red-400/70 hover:text-red-300 transition">✕</button>
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