"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ShoppingCart, 
  SlidersHorizontal, 
  Sparkles, 
  Store, 
  Flame, 
  Layers, 
  CreditCard 
} from "lucide-react";

interface ProductItem {
  id: number;
  slug?: string;
  thumbnail?: string;
  name: string;
  summary?: string;
  description?: string;
  base_price: number | string;
  originalPrice?: number;
  rating?: number;
  salesCount?: number;
  categories?: { id: number; name: string; slug: string }[];
  showcases?: { id: number; name: string; slug: string }[];
  modules?: { id: number; name: string; price: number; is_required: boolean }[];
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

interface ShowcaseItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface CartItem {
  product: ProductItem;
  qty: number;
}

export default function StoreHomePage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [showcases, setShowcases] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Shopee/Tokopedia Filters & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedShowcase, setSelectedShowcase] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "price_asc" | "price_desc">("latest");

  // Cart & Checkout
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custNotes, setCustNotes] = useState("");
  const [submittingCheckout, setSubmittingCheckout] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api-store.switchcode.id/api";

  // Fetch Categories & Showcases
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, showRes] = await Promise.all([
          fetch(`${apiUrl}/categories`),
          fetch(`${apiUrl}/showcases`)
        ]);
        const catData = await catRes.json();
        const showData = await showRes.json();
        if (catData.success) setCategories(catData.data || []);
        if (showData.success) setShowcases(showData.data || []);
      } catch (e) {}
    };
    fetchMetadata();
  }, [apiUrl]);

  // Fetch Products Live dari Backend (dengan Search, Category, Showcase, Sort)
  useEffect(() => {
    const fetchProductsList = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append("search", searchQuery.trim());
        if (selectedCategory !== "all") params.append("category_id", selectedCategory);
        if (selectedShowcase !== "all") params.append("showcase_id", selectedShowcase);
        if (sortBy) params.append("sort", sortBy);

        const res = await fetch(`${apiUrl}/products?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          const list = Array.isArray(data.data) ? data.data : (data.data?.data || []);
          setProducts(list);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProductsList();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedShowcase, sortBy, apiUrl]);

  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.product.id === product.id);
      if (exist) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setCartDrawerOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOpenCartCheckout = () => {
    // Verifikasi sesi login pelanggan
    const savedUser = localStorage.getItem("switchcode_user");
    if (!savedUser) {
      setCartDrawerOpen(false);
      window.location.href = `/login/?redirect=${encodeURIComponent("/#cart")}`;
      return;
    }

    try {
      const u = JSON.parse(savedUser);
      if (u.name) setCustName(u.name);
      if (u.email) setCustEmail(u.email);
    } catch (e) {}

    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  const totalCart = cart.reduce(
    (sum, item) => sum + Number(item.product.base_price) * item.qty,
    0
  );

  const handleProcessCartCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail || cart.length === 0) return;

    try {
      setSubmittingCheckout(true);
      const payload = {
        customer_name: custName,
        customer_email: custEmail,
        customer_phone: custPhone || null,
        notes: custNotes || null,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.qty
        }))
      };

      const res = await fetch(`${apiUrl}/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setCheckoutResult(data.data);
        setCart([]);
      } else {
        alert(data.message || "Gagal membuat pesanan.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmittingCheckout(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* SHOPEE/TOKOPEDIA HERO SEARCH & BANNER HEADER */}
      <section className="bg-gradient-to-b from-sky-50 via-white to-white border-b border-slate-200/80 -mt-6 sm:-mt-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Official SwitchCode Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Beli Source Code, API & Solusi Software Siap Pakai
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Katalog resmi teknologi enterprise, arsitektur modular, dan gateway pembayaran teruji produksi.
            </p>

            {/* Shopee-style Big Search Bar */}
            <div className="pt-2">
              <div className="relative max-w-2xl mx-auto flex items-center bg-white border-2 border-slate-300 focus-within:border-sky-500 rounded-2xl shadow-sm transition">
                <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari produk software, gateway, modul, atau kata kunci (cth: API Gateway, ERP)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-3.5 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mr-3 text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    ✕
                  </button>
                )}
                <div className="mr-2">
                  <span className="hidden sm:inline-block px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold">
                    Cari
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Showcase Tabs (Tokopedia-style Highlight Pills) */}
          {showcases.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedShowcase("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedShowcase === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Semua Etalase</span>
              </button>
              {showcases.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setSelectedShowcase(String(sc.id))}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedShowcase === String(sc.id)
                      ? "bg-amber-500 text-white shadow-xs font-bold"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>{sc.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FILTER BAR & LIST PRODUK */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Tokopedia/Shopee Secondary Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5" /> Kategori:
            </span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(String(c.id))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === String(c.id)
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
            >
              <option value="latest">Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>
        </div>

        {/* FEED KATALOG PRODUK */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-slate-500">Memuat katalog langsung dari database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">Tidak ada produk ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Coba ganti kata kunci pencarian atau ubah filter kategori dan etalase yang dipilih.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedShowcase("all"); }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => {
              const displayImg = p.thumbnail || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop";
              const priceNum = Number(p.base_price || 0);

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all hover:shadow-md flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Tokopedia/Shopee Clickable Card Thumbnail */}
                    <a href={`/product/?slug=${p.slug || p.id}`} className="block relative aspect-video w-full bg-slate-100 overflow-hidden">
                      <img
                        src={displayImg}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as any).src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop";
                        }}
                      />
                      {/* Badge Showcase / Hot Promo Overlay */}
                      {p.showcases && p.showcases.length > 0 && (
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                          {p.showcases.slice(0, 1).map((sc) => (
                            <span key={sc.id} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                              {sc.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Hover CTA hint */}
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-[11px] font-bold text-white bg-slate-900/90 px-3 py-1.5 rounded-lg shadow-sm">
                          Lihat Detail ➔
                        </span>
                      </div>
                    </a>

                    <div className="p-4 space-y-2.5">
                      {/* Categories Badges */}
                      <div className="flex flex-wrap gap-1">
                        {p.categories && p.categories.length > 0 ? (
                          p.categories.map((c) => (
                            <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                            Software Solution
                          </span>
                        )}
                      </div>

                      {/* Product Title */}
                      <a href={`/product/?slug=${p.slug || p.id}`}>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition line-clamp-2">
                          {p.name}
                        </h3>
                      </a>

                      {/* Summary */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {p.summary || p.description}
                      </p>

                      {/* Addon / Topping Indicator */}
                      {p.modules && p.modules.length > 0 && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md font-medium border border-amber-200/50">
                          🍦 Tersedia {p.modules.length} Opsi Topping
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Price & CTA */}
                  <div className="p-4 pt-0">
                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-[10px] text-slate-400 font-medium block">Mulai dari</span>
                      <div className="text-base font-extrabold text-slate-900">
                        Rp {priceNum.toLocaleString("id-ID")}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <a
                          href={`/product/?slug=${p.slug || p.id}`}
                          className="w-full text-center py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Detail
                        </a>
                        <button
                          onClick={() => addToCart(p)}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition active:scale-95 shadow-2xs cursor-pointer"
                        >
                          + Keranjang
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING CART BUTTON (Shopee / Tokopedia Style Floating Icon) */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 cursor-pointer transition transform hover:scale-105 active:scale-95"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-xs font-extrabold bg-white text-sky-700 px-2.5 py-1 rounded-full shadow-xs">
            {cart.reduce((a, b) => a + b.qty, 0)} item
          </span>
          <span className="text-xs font-bold pr-1">
            Rp {totalCart.toLocaleString("id-ID")}
          </span>
        </button>
      )}

      {/* CART DRAWER MODAL */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-sky-600" />
                  <span>Keranjang Belanja</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                    {cart.reduce((a, b) => a + b.qty, 0)}
                  </span>
                </h3>
                <button onClick={() => setCartDrawerOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600">Keranjang masih kosong</p>
                  <p className="text-xs text-slate-400">Pilih produk software favorit Anda di katalog.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Rp {Number(item.product.base_price).toLocaleString("id-ID")} x {item.qty}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-slate-900">
                          Rp {(Number(item.product.base_price) * item.qty).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
                    <button onClick={() => setCart([])} className="text-xs text-rose-500 hover:underline">
                      Kosongkan Keranjang
                    </button>
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Total Tagihan:</span>
                  <span className="font-black text-xl text-slate-900">
                    Rp {totalCart.toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={handleOpenCartCheckout}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Lanjut ke Pembayaran ➔</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL FORM DARI KERANJANG */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setCheckoutModalOpen(false); setCheckoutResult(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold text-lg"
            >
              ✕
            </button>

            {!checkoutResult ? (
              <form onSubmit={handleProcessCartCheckout} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                    ⚡ Form Pembayaran
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Selesaikan Pesanan Anda</h3>
                  <p className="text-xs text-slate-500">Checkout {cart.reduce((a, b) => a + b.qty, 0)} item produk software</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Pemesan *</label>
                    <input
                      type="text"
                      required
                      placeholder="cth: Budi Agung Santoso"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Pengiriman Source Code *</label>
                    <input
                      type="email"
                      required
                      placeholder="cth: budi@company.com"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Aktif</label>
                    <input
                      type="tel"
                      placeholder="cth: 08123456789"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                    <textarea
                      rows={2}
                      placeholder="Catatan instalasi atau domain target..."
                      value={custNotes}
                      onChange={(e) => setCustNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Bayar:</span>
                    <span className="text-xl font-black text-slate-900">
                      Rp {totalCart.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingCheckout}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-sky-600/20 disabled:opacity-50"
                  >
                    {submittingCheckout ? "Memproses..." : "Konfirmasi & Bayar ➔"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Pesanan Berhasil Terbit!</h3>
                  <p className="text-xs text-slate-500 mt-1">Nomor Order: <span className="font-mono font-bold text-slate-800">{checkoutResult.order_number}</span></p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-amber-600 uppercase">{checkoutResult.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total:</span>
                    <span className="font-bold text-slate-900">Rp {Number(checkoutResult.total_amount).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email Tujuan:</span>
                    <span className="font-medium text-slate-800">{checkoutResult.customer_email}</span>
                  </div>
                </div>

                {checkoutResult.payment_url ? (
                  <a
                    href={checkoutResult.payment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    Buka Pembayaran Midtrans Snap ➔
                  </a>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Konfirmasi pesanan telah tercatat di server kami dan akan diproses oleh tim SwitchCode.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => { setCheckoutModalOpen(false); setCheckoutResult(null); }}
                  className="w-full py-2.5 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}