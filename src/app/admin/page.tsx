"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, 
  FolderPlus, 
  ShoppingBag, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw, 
  LogOut,
  Sliders,
  DollarSign,
  Tag,
  ArrowUpRight
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "categories">("orders");
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const [newProdName, setNewProdName] = useState("");
  const [newProdCat, setNewProdCat] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdSummary, setNewProdSummary] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api-store.switchcode.id/api";

  useEffect(() => {
    const savedToken = localStorage.getItem("switchcode_token");
    const savedUserStr = localStorage.getItem("switchcode_user");
    if (!savedToken || !savedUserStr) {
      router.push("/login/");
      return;
    }
    const parsedUser = JSON.parse(savedUserStr);
    setUser(parsedUser);
    setToken(savedToken);
  }, []);

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchProducts();
      fetchCategories();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setOrders(d.data?.data || []);
    } catch (e) {}
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setProducts(d.data?.data || []);
    } catch (e) {}
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/categories`);
      const d = await res.json();
      if (d.success) setCategories(d.data || []);
    } catch (e) {}
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const d = await res.json();
      if (d.success) {
        setMessage(`Status order #${id} diubah jadi ${status}`);
        fetchOrders();
      }
    } catch (e) {}
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const res = await fetch(`${apiUrl}/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName, description: newCatDesc })
      });
      const d = await res.json();
      if (d.success) {
        setMessage(`Kategori "${newCatName}" berhasil ditambahkan.`);
        setNewCatName("");
        setNewCatDesc("");
        fetchCategories();
      }
    } catch (e) {}
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    try {
      const res = await fetch(`${apiUrl}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProdName,
          category: newProdCat,
          base_price: parseFloat(newProdPrice),
          summary: newProdSummary,
          description: newProdDesc
        })
      });
      const d = await res.json();
      if (d.success) {
        setMessage(`Produk "${newProdName}" berhasil disimpan ke etalase.`);
        setNewProdName("");
        setNewProdPrice("");
        setNewProdSummary("");
        setNewProdDesc("");
        fetchProducts();
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("switchcode_token");
    localStorage.removeItem("switchcode_user");
    router.push("/login/");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
              {user?.role?.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola tracking pesanan customer, etalase kategori, dan katalog produk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === "owner" && (
            <button
              onClick={() => router.push("/owner/")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition"
            >
              <span>👑 Buka Owner Panel</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-emerald-600 font-bold ml-2">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === "orders" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Tracking Pesanan ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === "products" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Input & Katalog Produk ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === "categories" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Kategori Etalase ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS TRACKING */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-800">Daftar Transaksi Masuk</h2>
              <button onClick={fetchOrders} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada pesanan masuk di store.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Order Number</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3 text-right">Aksi Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{o.order_number}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{o.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{o.customer_email}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          Rp {Number(o.total_amount).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              o.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : o.status === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : o.status === "completed"
                                ? "bg-sky-50 text-sky-700 border-sky-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {new Date(o.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, "paid")}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 text-[11px] font-medium"
                          >
                            Set Paid
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, "completed")}
                            className="px-2 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded hover:bg-sky-100 text-[11px] font-medium"
                          >
                            Selesai
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, "cancelled")}
                            className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100 text-[11px] font-medium"
                          >
                            Batal
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS INPUT & LIST */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Input Produk */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <h2 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Input Produk Baru</span>
            </h2>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Contoh: Microservice Starter Pack"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Etalase</label>
                <select
                  value={newProdCat}
                  onChange={(e) => setNewProdCat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Pilih Kategori...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value="Backend Boilerplate">Backend Boilerplate</option>
                  <option value="Full-Stack SaaS">Full-Stack SaaS</option>
                  <option value="Payment Adapter">Payment Adapter</option>
                  <option value="Desktop Utility">Desktop Utility</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Harga Dasar (Rp)</label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="249000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ringkasan Singkat</label>
                <textarea
                  rows={2}
                  value={newProdSummary}
                  onChange={(e) => setNewProdSummary(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu etalase"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Lengkap</label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Fitur lengkap, arsitektur, spesifikasi teknis..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition cursor-pointer mt-2"
              >
                + Simpan ke Etalase
              </button>
            </form>
          </div>

          {/* List Produk Aktif */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-800">Katalog Produk Aktif</h2>
              <span className="text-xs text-slate-500">{products.length} Item</span>
            </div>
            <div className="divide-y divide-slate-100">
              {products.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {p.category || "General"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.summary}</p>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      Rp {Number(p.base_price).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES INPUT & LIST */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <h2 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Input Kategori Baru</span>
            </h2>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Contoh: AI & ML Engine"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Kategori modul dan aplikasi kecerdasan buatan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition cursor-pointer mt-2"
              >
                + Tambah Kategori
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-800">Daftar Kategori Etalase</h2>
              <span className="text-xs text-slate-500">{categories.length} Kategori</span>
            </div>
            <div className="divide-y divide-slate-100">
              {categories.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{c.description || "Tidak ada deskripsi"}</p>
                    <span className="text-[11px] text-slate-400 font-mono mt-1 inline-block">Slug: {c.slug}</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {c.products_count || 0} Produk
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
