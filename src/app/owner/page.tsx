"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Trash2, 
  Crown, 
  ArrowLeft, 
  ShoppingBag, 
  Package, 
  AlertCircle,
  CheckCircle,
  Key
} from "lucide-react";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form add admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api-store.switchcode.id/api";

  useEffect(() => {
    const savedToken = localStorage.getItem("switchcode_token");
    const savedUserStr = localStorage.getItem("switchcode_user");
    if (!savedToken || !savedUserStr) {
      router.push("/login/");
      return;
    }
    const parsedUser = JSON.parse(savedUserStr);
    if (parsedUser.role !== "owner") {
      router.push("/admin/");
      return;
    }
    setUser(parsedUser);
    setToken(savedToken);
  }, []);

  useEffect(() => {
    if (token) {
      fetchAdmins();
    }
  }, [token]);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${apiUrl}/owner/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setAdmins(d.data || []);
      }
    } catch (e) {}
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${apiUrl}/owner/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password, role })
      });
      const d = await res.json();
      if (!res.ok || !d.success) {
        throw new Error(d.message || "Gagal menambahkan admin");
      }
      setMessage(`Berhasil! Pengguna ${name} dengan role [${role}] berhasil didaftarkan.`);
      setName("");
      setEmail("");
      setPassword("");
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAdmin = async (id: number, adminName: string) => {
    if (!confirm(`Hapus admin ${adminName}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/owner/admins/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setMessage(`Admin ${adminName} berhasil dihapus.`);
        fetchAdmins();
      }
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar Owner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-slate-900">
              Owner Management Suite
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              TOP TIER ROLE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hak akses tertinggi SwitchCode Store. Mengelola akun Admin dan delegasi wewenang operasional.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Buka Dashboard Operasional Admin</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="font-bold text-emerald-700">×</button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-bold text-rose-700">×</button>
        </div>
      )}

      {/* Grid: Add Admin Form + List Admins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah Admin */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-sm text-slate-900">Tambah Akun Staff / Admin</h2>
          </div>

          <form onSubmit={handleAddAdmin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Staff Operasional Toko"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Login</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@switchcode.id"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password Baru (min 8 karakter)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Hak Akses (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="admin">Admin (Kelola Produk, Kategori, Order)</option>
                <option value="owner">Owner (Wewenang Penuh + Hak Tambah Admin)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition cursor-pointer mt-2 shadow-sm"
            >
              + Buat Akun Baru
            </button>
          </form>
        </div>

        {/* List Admin & Owner */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <h2 className="font-bold text-sm text-slate-900">Daftar Pengguna Berwenang</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">{admins.length} Pengguna</span>
          </div>

          <div className="divide-y divide-slate-100">
            {admins.map((adm) => (
              <div key={adm.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    adm.role === "owner" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"
                  }`}>
                    {adm.role === "owner" ? "👑" : "🛡️"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{adm.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        adm.role === "owner" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : "bg-sky-50 text-sky-700 border-sky-200"
                      }`}>
                        {adm.role}
                      </span>
                      {adm.id === user?.id && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          Anda
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{adm.email}</div>
                  </div>
                </div>

                <div>
                  {adm.id !== user?.id && (
                    <button
                      onClick={() => handleDeleteAdmin(adm.id, adm.name)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Hak Akses"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
