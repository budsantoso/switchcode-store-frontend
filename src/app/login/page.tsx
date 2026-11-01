"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2,
  Sparkles
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Captcha & OTP States
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api-store.switchcode.id/api";

  // Fetch Captcha when switching to Register mode
  const fetchNewCaptcha = async () => {
    try {
      const res = await fetch(`${apiUrl}/auth/captcha`);
      const data = await res.json();
      if (data.success) {
        setCaptchaToken(data.data.captcha_token);
        setCaptchaQuestion(data.data.captcha_question);
        setCaptchaAnswer("");
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (mode === "register") {
      fetchNewCaptcha();
    }
  }, [mode]);

  // Request OTP Handler
  const handleRequestOtp = async () => {
    if (!email) {
      setError("Isi alamat email terlebih dahulu.");
      return;
    }
    if (!captchaAnswer) {
      setError("Jawab pertanyaan Captcha keamanan terlebih dahulu.");
      return;
    }

    setError(null);
    setOtpLoading(true);

    try {
      const res = await fetch(`${apiUrl}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          captcha_token: captchaToken,
          captcha_answer: captchaAnswer,
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal verifikasi Captcha.");
      }

      setOtpSent(true);
      setSuccessMsg(data.message);
      if (data.data?.otp_demo) {
        setDemoOtpHint(data.data.otp_demo);
      }
    } catch (err: any) {
      setError(err.message || "Gagal meminta kode OTP.");
      fetchNewCaptcha();
    } finally {
      setOtpLoading(false);
    }
  };

  // Submit Login or Register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === "login") {
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Email atau password salah.");
        }

        const user = data.data.user;
        localStorage.setItem("switchcode_token", data.data.token);
        localStorage.setItem("switchcode_user", JSON.stringify(user));

        if (redirectParam) {
          router.push(redirectParam);
        } else if (user.role === "owner") {
          router.push("/owner/");
        } else if (user.role === "admin") {
          router.push("/admin/");
        } else {
          router.push("/");
        }
      } else {
        // REGISTER FLOW WITH CAPTCHA & OTP
        if (!otpSent || !otpCode) {
          throw new Error("Silakan verifikasi Captcha dan masukkan Kode OTP 6 digit.");
        }

        const res = await fetch(`${apiUrl}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            captcha_token: captchaToken,
            otp_code: otpCode,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Gagal melakukan registrasi.");
        }

        const user = data.data.user;
        localStorage.setItem("switchcode_token", data.data.token);
        localStorage.setItem("switchcode_user", JSON.stringify(user));

        setSuccessMsg("Akun berhasil dibuat! Mengalihkan...");
        setTimeout(() => {
          if (redirectParam) {
            router.push(redirectParam);
          } else {
            router.push("/");
          }
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memproses autentikasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 font-extrabold text-lg shadow-md">
            SC
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {mode === "login" ? "Masuk ke Akun SwitchCode" : "Daftar Akun Baru"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {redirectParam ? "Silakan login/register terlebih dahulu sebelum menyelesaikan pesanan." : "Akses layanan order, tracking software, dan portal customer."}
          </p>
        </div>

        {/* Tab Toggle Login / Register */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Daftar (Register)
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="cth: Budi Agung"
                  className="w-full px-3.5 py-2.5 pl-10 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Akun
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 pl-10 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full px-3.5 py-2.5 pl-10 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* SECURITY CAPTCHA & OTP SECTION UNTUK REGISTRASI */}
          {mode === "register" && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              {/* Box Captcha */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>Verifikasi Captcha Matematika</span>
                  </span>
                  <button
                    type="button"
                    onClick={fetchNewCaptcha}
                    className="text-[11px] text-sky-700 hover:text-sky-900 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Ganti
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-white border border-sky-300 rounded-xl font-mono font-bold text-sm text-slate-900 tracking-wider">
                    {captchaQuestion || "Membuat Captcha..."}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Hasil?"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-24 px-3 py-2 text-center text-sm font-bold bg-white border border-sky-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={otpLoading || !captchaAnswer}
                    className="flex-1 py-2 px-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    {otpLoading ? "Memproses..." : "Kirim OTP"}
                  </button>
                </div>
              </div>

              {/* Box Input OTP */}
              {otpSent && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>Masukkan Kode OTP 6 Digit</span>
                    </span>
                    {demoOtpHint && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-mono px-2 py-0.5 rounded font-bold">
                        Demo OTP: {demoOtpHint}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Contoh: 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3 py-2 text-center tracking-widest font-mono font-bold text-base bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === "register" && !otpCode)}
            className="w-full mt-3 py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : mode === "login" ? (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Verifikasi OTP & Selesaikan Pendaftaran</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sistem Keamanan Captcha & OTP Terverifikasi</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center text-xs text-slate-500">
        Memuat modul autentikasi...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}