"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import CoursesTab from "./components/CoursesTab";
import CalendarTab from "./components/CalendarTab";
import MembersTab from "./components/MembersTab";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"courses" | "calendar" | "members">("courses");

  // Admin Giriş Doğrulaması
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Sabit Kullanıcı Adı ve Şifre Kontrolü (İsteğe göre güncelleyebilirsin)
    if (username === "admin" && password === "akdeniz2026") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Hatalı kullanıcı adı veya şifre!");
    }
  };

  // Eğer admin girişi yapılmadıysa Giriş Formunu Göster
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-amber-400">Admin Paneli Girişi</h1>
            <p className="text-sm text-neutral-400 mt-2">
              Yönetici paneline erişmek için bilgilerinizi giriniz.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-500 text-neutral-950 font-semibold py-3 rounded-xl transition duration-200"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Giriş Başarılı İse Admin Panelini Göster
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row font-sans">
      {/* Sol Navigasyon */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sağ İçerik Ekranı */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === "courses" && <CoursesTab />}
        {activeTab === "calendar" && <CalendarTab />}
        {activeTab === "members" && <MembersTab />}
      </main>
    </div>
  );
}