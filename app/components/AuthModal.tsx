"use client";

import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<"form" | "code">("form");

  // Form State
  const [emailPrefix, setEmailPrefix] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const fullEmail = `${emailPrefix.trim().toLowerCase()}@ogr.akdeniz.edu.tr`;

  const resetForm = () => {
    setError("");
    setLoading(false);
    setStep("form");
    setPassword("");
    setConfirmPassword("");
    setCode("");
  };

  // --- GİRİŞ YAP ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailPrefix.trim()) {
      setError("Lütfen öğrenci numaranızı giriniz.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fullEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giriş yapılamadı.");

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- KAYIT OL (KOD İSTEME) ---
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Lütfen Ad Soyad alanını doldurunuz.");
      return;
    }

    if (!emailPrefix.trim()) {
      setError("Lütfen öğrenci numaranızı giriniz.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Girdiğiniz şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fullEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kod gönderilemedi.");

      setStep("code");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- KAYIT OL (ONAYLAMA) ---
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fullEmail,
          password,
          name: name.trim(),
          code,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt tamamlanamadı.");

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="w-full max-w-md bg-neutral-900/95 border border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black relative backdrop-blur-2xl">
        
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800/60 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand & Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xl mb-3 shadow-inner">
            🎓
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Akdeniz Tıp Portal
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === "login" ? "Hesabınıza erişmek için giriş yapın" : "Yeni bir öğrenci hesabı oluşturun"}
          </p>
        </div>

        {/* Modern Segmented Navigation (Tab) */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-950 border border-neutral-800/80 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              resetForm();
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              mode === "login"
                ? "bg-neutral-800 text-yellow-400 shadow-md border border-neutral-700/60"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              resetForm();
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              mode === "register"
                ? "bg-neutral-800 text-yellow-400 shadow-md border border-neutral-700/60"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* --- GİRİŞ YAP FORMU --- */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Öğrenci E-Postası
              </label>
              <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden focus-within:border-yellow-500/60 transition-all">
                <input
                  type="text"
                  required
                  placeholder="2023105001"
                  value={emailPrefix}
                  onChange={(e) => setEmailPrefix(e.target.value.replace("@ogr.akdeniz.edu.tr", ""))}
                  className="w-full bg-transparent px-4 py-3 text-sm text-white focus:outline-none placeholder:text-neutral-600"
                />
                <span className="bg-neutral-900/90 border-l border-neutral-800/80 px-3 py-3 text-xs text-neutral-400 select-none font-mono">
                  @ogr.akdeniz.edu.tr
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Şifre
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500/60 transition-all placeholder:text-neutral-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-yellow-500/10 active:scale-[0.99] disabled:opacity-50 text-xs cursor-pointer mt-3"
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        )}

        {/* --- KAYIT OL FORMU --- */}
        {mode === "register" && (
          <>
            {step === "form" ? (
              <form onSubmit={handleRequestCode} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Ad Soyad <span className="text-yellow-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ali Efe Küçükoğlu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/60 transition-all placeholder:text-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Öğrenci Numarası / Adı <span className="text-yellow-500">*</span>
                  </label>
                  <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden focus-within:border-yellow-500/60 transition-all">
                    <input
                      type="text"
                      required
                      placeholder="2023105001"
                      value={emailPrefix}
                      onChange={(e) => setEmailPrefix(e.target.value.replace("@ogr.akdeniz.edu.tr", ""))}
                      className="w-full bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none placeholder:text-neutral-600"
                    />
                    <span className="bg-neutral-900/90 border-l border-neutral-800/80 px-3 py-2.5 text-xs text-neutral-400 select-none font-mono">
                      @ogr.akdeniz.edu.tr
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Şifre <span className="text-yellow-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 kr."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/60 transition-all placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Şifre Tekrarı <span className="text-yellow-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Tekrar girin"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/60 transition-all placeholder:text-neutral-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-yellow-500/10 active:scale-[0.99] text-xs disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? "Kontrol Ediliyor..." : "Doğrulama Kodu Gönder"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-400">
                  <span className="text-yellow-400 font-mono block text-center font-bold mb-1">{fullEmail}</span>
                  adresine 6 haneli doğrulama kodu gönderildi.
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2 text-center">
                    E-Postanıza Gelen Kod
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-center tracking-[0.5em] font-mono text-xl text-yellow-400 focus:outline-none focus:border-yellow-500/80 transition-all"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="w-1/3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 rounded-2xl text-xs transition-all cursor-pointer"
                  >
                    Geri
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-3 rounded-2xl text-xs transition-all shadow-lg shadow-yellow-500/10 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Kaydediliyor..." : "Kayıt Ol ve Giriş Yap"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}