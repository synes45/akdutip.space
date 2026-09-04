"use client";

import { useEffect, useState, useMemo } from "react";

interface UserStats {
  watchCount: number;
  noteCount: number;
  playlistCount: number;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  stats: UserStats;
}

// ── Kullanıcı Detay Modalı ────────────────────────────────
function UserModal({ user, onClose, onRoleChange, onDelete }: {
  user: User;
  onClose: () => void;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}) {
  const [roleLoading, setRoleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();
  const isAdmin = user.role === "ADMIN";

  const handleRoleToggle = async () => {
    setRoleLoading(true);
    await onRoleChange(user.id, isAdmin ? "STUDENT" : "ADMIN");
    setRoleLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`"${user.name || user.email}" adlı kullanıcıyı ve tüm verilerini silmek istediğine emin misin?`)) return;
    setDeleteLoading(true);
    await onDelete(user.id);
    setDeleteLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 ${isAdmin ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-amber-400/20 text-amber-300 border border-amber-400/30"}`}>
              {initials}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{user.name || "İsimsiz Üye"}</h3>
              <p className="text-xs text-zinc-400 font-mono">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1 cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "İzleme", value: user.stats.watchCount, color: "text-amber-400" },
            { label: "Not", value: user.stats.noteCount, color: "text-sky-400" },
            { label: "Playlist", value: user.stats.playlistCount, color: "text-emerald-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 text-center">
              <span className={`text-xl font-bold ${color} block`}>{value}</span>
              <span className="text-[10px] text-zinc-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-xs text-zinc-400 bg-white/[0.02] rounded-2xl p-4 border border-white/[0.06]">
          <div className="flex justify-between">
            <span>Kayıt Tarihi</span>
            <span className="text-zinc-200 font-mono">{new Date(user.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}</span>
          </div>
          <div className="flex justify-between">
            <span>Son Güncelleme</span>
            <span className="text-zinc-200 font-mono">{new Date(user.updatedAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}</span>
          </div>
          <div className="flex justify-between">
            <span>Kullanıcı ID</span>
            <span className="text-zinc-500 font-mono text-[10px] truncate max-w-[160px]">{user.id}</span>
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="flex gap-3">
          <button
            onClick={handleRoleToggle}
            disabled={roleLoading}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
              isAdmin
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10"
                : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20"
            }`}
          >
            {roleLoading ? "Güncelleniyor..." : isAdmin ? "Adminliği Kaldır" : "Admin Yap"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex-1 py-2.5 rounded-2xl text-xs font-semibold bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {deleteLoading ? "Siliniyor..." : "Kullanıcıyı Sil"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ana MembersTab ────────────────────────────────────────
export default function MembersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "STUDENT" | "ADMIN">("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      setSelectedUser((prev) => prev?.id === userId ? { ...prev, role: newRole } : prev);
    }
  };

  const handleDelete = async (userId: string) => {
    const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  const filtered = useMemo(() => users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  }), [users, search, roleFilter]);

  // İstatistik hesapla
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = users.filter((u) => new Date(u.createdAt) >= thisMonthStart).length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Üye", value: users.length, icon: "👥", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
          { label: "Bu Ay Yeni", value: newThisMonth, icon: "🆕", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
          { label: "Admin", value: adminCount, icon: "🛡️", color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/20" },
          { label: "Öğrenci", value: users.length - adminCount, icon: "🎓", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/20" },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-4`}>
            <span className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center ${bg} border text-xl`}>{icon}</span>
            <div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-[11px] text-zinc-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Arama + Filtre */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim veya e-posta ara..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "STUDENT", "ADMIN"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                roleFilter === r
                  ? "bg-amber-400 text-black border-amber-400 font-semibold"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              {r === "ALL" ? "Tümü" : r === "STUDENT" ? "Öğrenci" : "Admin"}
            </button>
          ))}
        </div>
      </div>

      {/* Kullanıcı Listesi */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent" />
            <p className="text-xs text-zinc-500">Üyeler yükleniyor...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-sm">
          {search ? `"${search}" için sonuç bulunamadı.` : "Henüz kayıtlı üye yok."}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Tablo Başlığı */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/[0.06]">
            <span className="w-9" />
            <span>Kullanıcı</span>
            <span className="hidden md:block">İzleme / Not</span>
            <span>Rol</span>
            <span>Aksiyonlar</span>
          </div>

          {filtered.map((u) => {
            const isAdmin = u.role === "ADMIN";
            const initials = (u.name || u.email).slice(0, 2).toUpperCase();

            return (
              <div
                key={u.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-colors group"
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm cursor-pointer shrink-0 transition-transform group-hover:scale-105 ${
                    isAdmin
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-white/[0.06] text-amber-300 border border-white/10"
                  }`}
                  onClick={() => setSelectedUser(u)}
                  title="Detayları Gör"
                >
                  {initials}
                </div>

                {/* İsim + Email */}
                <div className="min-w-0 cursor-pointer" onClick={() => setSelectedUser(u)}>
                  <p className="text-sm font-medium text-white truncate">{u.name || "İsimsiz Üye"}</p>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">{u.email}</p>
                </div>

                {/* İzleme / Not sayısı */}
                <div className="hidden md:flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="text-amber-400">▶</span> {u.stats.watchCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-sky-400">✎</span> {u.stats.noteCount}
                  </span>
                </div>

                {/* Rol Rozeti */}
                <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider whitespace-nowrap ${
                  isAdmin
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    : "bg-white/[0.04] border-white/10 text-zinc-400"
                }`}>
                  {u.role}
                </span>

                {/* Hızlı Aksiyonlar */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRoleChange(u.id, isAdmin ? "STUDENT" : "ADMIN")}
                    title={isAdmin ? "Adminliği Kaldır" : "Admin Yap"}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`"${u.name || u.email}" silinsin mi?`)) return;
                      await handleDelete(u.id);
                    }}
                    title="Sil"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedUser(u)}
                    title="Detaylar"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detay Modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}