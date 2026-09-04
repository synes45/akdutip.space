"use client";

import { useEffect, useState } from "react";

interface ReportVideo {
  id: string;
  title: string;
  committeeTitle: string;
  lessonName: string;
}

interface Reporter {
  id: string | null;
  name: string | null;
  email: string;
}

interface Report {
  id: string;
  note: string;
  status: string;
  createdAt: string;
  video: ReportVideo;
  reporter: Reporter;
}

export default function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (res.ok) setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (report: Report) => {
    const newStatus = report.status === "PENDING" ? "RESOLVED" : "PENDING";
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: report.id, status: newStatus }),
    });
    if (res.ok) {
      setReports((prev) =>
        prev.map((r) => r.id === report.id ? { ...r, status: newStatus } : r)
      );
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Bu raporu silmek istediğine emin misin?")) return;
    const res = await fetch(`/api/admin/reports?reportId=${reportId}`, { method: "DELETE" });
    if (res.ok) setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const filtered = reports.filter((r) => filter === "ALL" || r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const resolvedCount = reports.filter((r) => r.status === "RESOLVED").length;

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      {/* İstatistik + Başlık */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Toplam Rapor", value: reports.length, color: "text-zinc-200", bg: "bg-white/[0.02] border-white/10" },
          { label: "Bekleyen", value: pendingCount, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
          { label: "Çözümlendi", value: resolvedCount, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`p-4 rounded-2xl border ${bg} flex items-center justify-between`}>
            <span className="text-xs text-zinc-400">{label}</span>
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Filtre */}
      <div className="flex items-center gap-2">
        {(["ALL", "PENDING", "RESOLVED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
              filter === f
                ? "bg-amber-400 text-black border-amber-400 font-semibold"
                : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            {f === "ALL" ? "Tümü" : f === "PENDING" ? "Bekleyen" : "Çözümlendi"}
            {f === "PENDING" && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={fetchReports}
          className="ml-auto p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.05] border border-white/[0.06] transition-colors cursor-pointer"
          title="Yenile"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Rapor Listesi */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent" />
            <p className="text-xs text-zinc-500">Raporlar yükleniyor...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-2xl">
            ✅
          </div>
          <p className="text-sm text-zinc-400">
            {filter === "PENDING" ? "Bekleyen rapor yok. Her şey temiz!" : "Bu filtrede rapor bulunamadı."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const isPending = report.status === "PENDING";
            return (
              <div
                key={report.id}
                className={`p-5 rounded-2xl border transition-colors ${
                  isPending
                    ? "bg-amber-400/[0.03] border-amber-400/20"
                    : "bg-white/[0.02] border-white/[0.06]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Sol: Video + Mesaj */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                        isPending
                          ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                          : "bg-emerald-400/10 border-emerald-400/30 text-emerald-300"
                      }`}>
                        {isPending ? "Bekliyor" : "Çözümlendi"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(report.createdAt).toLocaleDateString("tr-TR", {
                          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white/90 truncate">{report.video.title}</p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {report.video.committeeTitle} / {report.video.lessonName}
                      </p>
                    </div>

                    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                      <p className="text-xs text-zinc-300 leading-relaxed">{report.note}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{report.reporter.name || report.reporter.email || "Anonim"}</span>
                    </div>
                  </div>

                  {/* Sağ: Butonlar */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleStatusToggle(report)}
                      className={`px-3 py-2 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                        isPending
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                          : "bg-amber-400/10 border-amber-400/20 text-amber-300 hover:bg-amber-400/20"
                      }`}
                    >
                      {isPending ? "✓ Çözüldü" : "↩ Beklet"}
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="px-3 py-2 rounded-xl text-[11px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
