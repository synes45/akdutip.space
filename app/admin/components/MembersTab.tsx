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
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            👥 Kayıtlı Üyeler
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Platforma kayıt olmuş tüm Akdeniz Tıp öğrencileri
          </p>
        </div>
        <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-xl">
          Toplam: {users.length} Üye
        </span>
      </div>

      {loading ? (
        <div className="text-center py-8 text-neutral-500 text-sm">
          Üyeler yükleniyor...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 text-sm">
          Henüz kayıtlı üye bulunmuyor.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-xs font-semibold text-neutral-400">
                <th className="py-3 px-4">Ad Soyad</th>
                <th className="py-3 px-4">E-Posta</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4 text-right">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50 text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-800/30 transition-all">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {u.name || "İsimsiz"}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-300 font-mono text-xs">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        u.role === "ADMIN"
                          ? "bg-red-500/10 border border-red-500/30 text-red-400"
                          : "bg-neutral-800 border border-neutral-700 text-neutral-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs text-neutral-500 font-mono">
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
  );
}