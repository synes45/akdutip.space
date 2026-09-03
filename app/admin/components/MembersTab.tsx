"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function MembersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans text-zinc-100">
      {/* Üst Başlık & Üye İstatistiği Kartı */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl flex items-center justify-between shadow-2xl">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Kayıtlı Üyeler & Roller
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Platforma kayıt olmuş Akdeniz Tıp öğrencileri ve yetki düzeyleri.
          </p>
        </div>
        <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          Toplam: {users.length} Üye
        </span>
      </div>

      {/* Tablo Konteyneri */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl">
        {loading ? (
          <div className="text-center py-12 text-zinc-500 font-mono text-xs">
            Üyeler yükleniyor...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 font-mono text-xs">
            Henüz kayıtlı üye bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ad Soyad</th>
                  <th className="py-3 px-4">E-Posta</th>
                  <th className="py-3 px-4">Rol / Yetki</th>
                  <th className="py-3 px-4 text-right">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[11px] text-amber-400 font-bold">
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                      <span>{u.name || "İsimsiz Üye"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-xs">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${
                          u.role === "ADMIN"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            : "bg-white/5 border-white/10 text-zinc-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-500 font-mono text-xs">
                      {new Date(u.createdAt).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}