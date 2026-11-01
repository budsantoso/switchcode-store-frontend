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
  ArrowUpRight,
  Store,
  ChevronRight,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "categories" | "showcases">("orders");
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showcases, setShowcases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const [newShowcaseName, setNewShowcaseName] = useState("");
  const [newShowcaseDesc, setNewShowcaseDesc] = useState("");
  const [selectedShowcaseProds, setSelectedShowcaseProds] = useState<number[]>([]);

  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdSummary, setNewProdSummary] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [newProdThumbnail, setNewProdThumbnail] = useState<string>("");
  const [newProdGalleryUrls, setNewProdGalleryUrls] = useState<string>("");
  const [selectedProdCats, setSelectedProdCats] = useState<number[]>([]);
  const [selectedProdShowcases, setSelectedProdShowcases] = useState<number[]>([]);

  // Toppings / Add-ons state
  const [prodToppings, setProdToppings] = useState<{ id?: number; name: string; price: number; is_required: boolean }[]>([]);
  const [newTopName, setNewTopName] = useState("");
  const [newTopPrice, setNewTopPrice] = useState("");
  const [newTopReq, setNewTopReq] = useState(false);

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
      fetchShowcases();
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

  const fetchShowcases = async () => {
    try {
      const res = await fetch(`${apiUrl}/showcases`);
      const d = await res.json();
      if (d.success) setShowcases(d.data || []);
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

  const startEditProduct = (p: any) => {
    setEditingProductId(p.id);
    setNewProdName(p.name || "");
    setNewProdPrice(String(p.base_price || ""));
    setNewProdSummary(p.summary || "");
    setNewProdDesc(p.description || "");
    setNewProdThumbnail(p.thumbnail || p.thumbnail_url || "");
    setSelectedProdCats(p.categories ? p.categories.map((c: any) => c.id) : []);
    setSelectedProdShowcases(p.showcases ? p.showcases.map((s: any) => s.id) : []);
    setProdToppings(p.modules ? p.modules.map((m: any) => ({
      id: m.id,
      name: m.name,
      price: Number(m.price || 0),
      is_required: !!m.is_required
    })) : []);
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdSummary("");
    setNewProdDesc("");
    setNewProdThumbnail("");
    setNewProdGalleryUrls("");
    setSelectedProdCats([]);
    setSelectedProdShowcases([]);
    setProdToppings([]);
  };

  const handleAddTopping = () => {
    if (!newTopName || !newTopPrice) return;
    setProdToppings([
      ...prodToppings,
      {
        name: newTopName,
        price: parseFloat(newTopPrice),
        is_required: newTopReq
      }
    ]);
    setNewTopName("");
    setNewTopPrice("");
    setNewTopReq(false);
  };

  const handleRemoveTopping = (index: number) => {
    setProdToppings(prodToppings.filter((_, i) => i !== index));
  };

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    try {
      const isEdit = !!editingProductId;
      const endpoint = isEdit ? `${apiUrl}/admin/products/${editingProductId}` : `${apiUrl}/admin/products`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProdName,
          base_price: parseFloat(newProdPrice),
          summary: newProdSummary,
          description: newProdDesc,
          thumbnail: newProdThumbnail || null,
          category_ids: selectedProdCats,
          showcase_ids: selectedProdShowcases,
          modules: prodToppings,
        })
      });
      const d = await res.json();
      if (d.success) {
        setMessage(isEdit ? `Produk "${newProdName}" berhasil diupdate.` : `Produk "${newProdName}" berhasil disimpan.`);
        cancelEditProduct();
        fetchProducts();
      }
    } catch (e) {}
  };

  const handleCreateShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShowcaseName) return;
    try {
      const res = await fetch(`${apiUrl}/admin/showcases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newShowcaseName,
          description: newShowcaseDesc,
          product_ids: selectedShowcaseProds
        })
      });
      const d = await res.json();
      if (d.success) {
        setMessage(`Etalase "${newShowcaseName}" berhasil dibuat dengan ${selectedShowcaseProds.length} produk.`);
        setNewShowcaseName("");
        setNewShowcaseDesc("");
        setSelectedShowcaseProds([]);
        fetchShowcases();
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("switchcode_token");
    localStorage.removeItem("switchcode_user");
    router.push("/login/");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          {/* Top Branding */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                SC
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 leading-tight">SwitchCode</div>
                <div className="text-[11px] text-slate-500 font-medium">Operations Center</div>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Card */}
          <div className="p-4 m-3 bg-slate-50 border border-slate-200/60 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-800">{user?.name || "Staff Admin"}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{user?.email}</div>
            <div className="mt-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                {user?.role || "ADMIN"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </div>

            <button
              onClick={() => { setActiveTab("orders"); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === "orders" 
                  ? "bg-slate-900 text-white font-semibold shadow-xs" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Tracking Pesanan</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "orders" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("products"); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === "products" 
                  ? "bg-slate-900 text-white font-semibold shadow-xs" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>List Produk</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "products" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("categories"); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === "categories" 
                  ? "bg-slate-900 text-white font-semibold shadow-xs" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4" />
                <span>Kategori</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "categories" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("showcases"); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeTab === "showcases" 
                  ? "bg-slate-900 text-white font-semibold shadow-xs" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4" />
                <span>Etalase Toko</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "showcases" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {showcases.length}
              </span>
            </button>

            {/* Quick Links */}
            <div className="pt-4 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Akses Cepat
            </div>

            <a
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4" />
                <span>Lihat Web Toko</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {user?.role === "owner" && (
              <button
                onClick={() => router.push("/owner/")}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 transition font-semibold cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Suite Owner</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            )}
          </nav>
        </div>

        {/* Bottom Sidebar Action */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header for Mobile & Title Bar */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 capitalize">
                {activeTab === "orders" && "Tracking Pesanan Customer"}
                {activeTab === "products" && "List Produk & Tambah Produk (Multi Kategori)"}
                {activeTab === "categories" && "Manajemen Kategori Produk"}
                {activeTab === "showcases" && "Manajemen Etalase Toko"}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Pusat kontrol operasional SwitchCode Store Indonesia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { fetchOrders(); fetchProducts(); fetchCategories(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto">

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
          {/* Form Input / Edit Produk */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>{editingProductId ? "Edit Data Produk" : "Input Produk Baru"}</span>
              </h2>
              {editingProductId && (
                <button
                  type="button"
                  onClick={cancelEditProduct}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Batal Edit
                </button>
              )}
            </div>
            <form onSubmit={handleCreateOrUpdateProduct} className="space-y-3 text-xs">
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Gambar / Thumbnail URL (Tampil ke Customer)
                </label>
                <input
                  type="text"
                  value={newProdThumbnail}
                  onChange={(e) => setNewProdThumbnail(e.target.value)}
                  placeholder="https://... atau /products/img.jpg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  URL gambar mockup / screenshot untuk carousel & cover produk
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Kategori (Bisa Multi-Kategori)
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-h-32 overflow-y-auto space-y-1.5">
                  {categories.length === 0 ? (
                    <span className="text-slate-400 text-[11px]">Belum ada kategori</span>
                  ) : (
                    categories.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={selectedProdCats.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProdCats([...selectedProdCats, c.id]);
                            } else {
                              setSelectedProdCats(selectedProdCats.filter((id) => id !== c.id));
                            }
                          }}
                          className="rounded text-slate-900"
                        />
                        <span>{c.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Etalase Toko (Opsional)
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-h-32 overflow-y-auto space-y-1.5">
                  {showcases.length === 0 ? (
                    <span className="text-slate-400 text-[11px]">Belum ada etalase</span>
                  ) : (
                    showcases.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={selectedProdShowcases.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProdShowcases([...selectedProdShowcases, s.id]);
                            } else {
                              setSelectedProdShowcases(selectedProdShowcases.filter((id) => id !== s.id));
                            }
                          }}
                          className="rounded text-slate-900"
                        />
                        <span>{s.name}</span>
                      </label>
                    ))
                  )}
                </div>
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
                  placeholder="Ringkasan 1-2 kalimat untuk kartu katalog"
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

              {/* SECTION FITUR TOPPING PRODUK */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-semibold text-slate-800 text-xs">
                    🍦 Topping / Add-on Produk ({prodToppings.length})
                  </label>
                </div>

                {/* List Topping yang sudah ditambahkan */}
                {prodToppings.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {prodToppings.map((top, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-amber-50/50 border border-amber-200/60 rounded-lg text-[11px]">
                        <div>
                          <span className="font-semibold text-slate-800">{top.name}</span>
                          <span className="text-slate-500 ml-1.5">(+Rp {top.price.toLocaleString("id-ID")})</span>
                          {top.is_required && (
                            <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold uppercase">Wajib</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopping(idx)}
                          className="text-rose-600 hover:text-rose-800 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form mini input topping baru */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Topping (cth: Setup Domain)"
                      value={newTopName}
                      onChange={(e) => setNewTopName(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Harga (cth: 50000)"
                      value={newTopPrice}
                      onChange={(e) => setNewTopPrice(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTopReq}
                        onChange={(e) => setNewTopReq(e.target.checked)}
                        className="rounded text-slate-900"
                      />
                      <span>Topping Wajib (Required)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddTopping}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-semibold transition"
                    >
                      + Tambah Topping
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition cursor-pointer mt-2"
              >
                {editingProductId ? "Simpan Perubahan Produk" : "+ Simpan Produk"}
              </button>
            </form>
          </div>

          {/* List Produk Aktif */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-800">List Produk Terdaftar</h2>
              <span className="text-xs text-slate-500">{products.length} Item</span>
            </div>
            <div className="divide-y divide-slate-100">
              {products.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.summary}</p>
                    
                    {/* Multi Categories Badges */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.categories && p.categories.length > 0 ? (
                        p.categories.map((c: any) => (
                          <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                            🏷️ {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-400">
                          Tanpa Kategori
                        </span>
                      )}

                      {/* Showcases Badges */}
                      {p.showcases && p.showcases.length > 0 && (
                        p.showcases.map((s: any) => (
                          <span key={s.id} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                            🏪 {s.name}
                          </span>
                        ))
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-900 mt-2">
                      Rp {Number(p.base_price).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      Aktif
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditProduct(p)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                    >
                      ✏️ Edit Produk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES INPUT & LIST */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs h-fit">
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

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-800">Daftar Kategori Produk</h2>
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

      {/* TAB 4: SHOWCASES (ETALASE) INPUT & LIST */}
      {activeTab === "showcases" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs h-fit">
            <h2 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Buat Etalase Baru</span>
            </h2>
            <form onSubmit={handleCreateShowcase} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Etalase</label>
                <input
                  type="text"
                  required
                  value={newShowcaseName}
                  onChange={(e) => setNewShowcaseName(e.target.value)}
                  placeholder="Contoh: Promo Ramadhan / Best Seller 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Etalase</label>
                <textarea
                  rows={2}
                  value={newShowcaseDesc}
                  onChange={(e) => setNewShowcaseDesc(e.target.value)}
                  placeholder="Koleksi produk unggulan dengan diskon khusus"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Produk yang Masuk ke Etalase Ini (Banyak Produk)
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto space-y-1.5">
                  {products.length === 0 ? (
                    <span className="text-slate-400 text-[11px]">Belum ada produk</span>
                  ) : (
                    products.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={selectedShowcaseProds.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedShowcaseProds([...selectedShowcaseProds, p.id]);
                            } else {
                              setSelectedShowcaseProds(selectedShowcaseProds.filter((id) => id !== p.id));
                            }
                          }}
                          className="rounded text-slate-900"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition cursor-pointer mt-2"
              >
                + Simpan Etalase
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-800">Daftar Etalase Toko</h2>
              <span className="text-xs text-slate-500">{showcases.length} Etalase</span>
            </div>
            <div className="divide-y divide-slate-100">
              {showcases.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Belum ada etalase dibuat.</div>
              ) : (
                showcases.map((s) => (
                  <div key={s.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <span>🏪 {s.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                            {s.products?.length || 0} Produk Terisi
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{s.description || "Tidak ada deskripsi"}</p>
                      </div>
                    </div>

                    {/* Preview Produk dalam Etalase */}
                    {s.products && s.products.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                        {s.products.map((p: any) => (
                          <span key={p.id} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                            ✓ {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
