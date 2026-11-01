"use client";

import { useState } from "react";

interface Product {
  id: number;
  name: string;
  category: string;
  tag: string;
  price: number;
  originalPrice: number;
  rating: number;
  salesCount: number;
  description: string;
  features: string[];
  stack: string[];
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "FastAPI High-Performance API Gateway",
    category: "Backend Boilerplate",
    tag: "Best Seller",
    price: 249000,
    originalPrice: 499000,
    rating: 4.9,
    salesCount: 142,
    description: "Production-ready API Gateway dengan Redis token bucket rate limiting, JWT multi-auth, background tasks, dan Docker containerization siap pakai.",
    features: [
      "Redis Sliding Window Rate Limiting",
      "Stateless JWT & Refresh Token Rotation",
      "Prometheus & Sentry Observability",
      "Auto-generated OpenAPI & Swagger docs"
    ],
    stack: ["Python 3.11+", "FastAPI", "Redis", "Docker", "PostgreSQL"]
  },
  {
    id: 2,
    name: "SaaS Enterprise Invoice Intelligence",
    category: "Full-Stack SaaS",
    tag: "Featured",
    price: 399000,
    originalPrice: 799000,
    rating: 5.0,
    salesCount: 88,
    description: "Sistem ekstraksi invoice cerdas berbasis AI Vision, integrasi gateway Midtrans QRIS/VA, reconciliation report Excel, dan multi-tenant billing.",
    features: [
      "AI OCR Extraction (JSON Canonical Output)",
      "Automated Payment Reconciliation",
      "Midtrans Snap & Webhook Receiver V2",
      "Custom PDF Invoice Layout Designer"
    ],
    stack: ["Laravel 13", "Next.js 16", "PostgreSQL", "Tailwind CSS"]
  },
  {
    id: 3,
    name: "DOKU V2 Jokul Payment Migration Bridge",
    category: "Payment Adapter",
    tag: "Enterprise",
    price: 349000,
    originalPrice: 599000,
    rating: 4.8,
    salesCount: 65,
    description: "Adapter bridging otomatis untuk menerima webhook DOKU V2 JSON dan mentransformasikan ke legacy system (PeopleSoft, SAP, Core Banking).",
    features: [
      "HMAC-SHA256 Signature Verification",
      "Automatic V1 / V2 Payload Detection",
      "Oracle DB & SQL Server Dual Transaction",
      "MinIO Storage Raw Request Archiving"
    ],
    stack: ["Laravel 13", "Oracle OCI8", "SQL Server", "RabbitMQ"]
  },
  {
    id: 4,
    name: "Dynamic Island Windows Desktop Widget",
    category: "Desktop Utility",
    tag: "New Release",
    price: 149000,
    originalPrice: 299000,
    rating: 4.9,
    salesCount: 39,
    description: "Aplikasi widget desktop floating ala Dynamic Island untuk Windows. Terhubung live ke browser Firefox (YouTube) dan tracker Work Activity.",
    features: [
      "Frameless Floating Window with Glass Effect",
      "WebSocket Real-time Media Controller",
      "Quick Clock In / Clock Out Absensi WorkSync",
      "Ultra-low RAM Usage (< 45MB)"
    ],
    stack: ["Python", "PyQt6", "WebSockets", "Firefox Extension"]
  }
];

export default function StoreHomePage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [activeModal, setActiveModal] = useState<Product | null>(null);

  const categories = ["Semua", "Backend Boilerplate", "Full-Stack SaaS", "Payment Adapter", "Desktop Utility"];

  const filteredProducts = selectedCategory === "Semua" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const exist = prev.find(item => item.product.id === p.id);
      if (exist) {
        return prev.map(item => item.product.id === p.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product: p, qty: 1 }];
    });
  };

  const totalCart = cart.reduce((acc, curr) => acc + (curr.product.price * curr.qty), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Banner Clean Light */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 mb-10 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100 mb-4">
            🚀 Marketplace Resmi Switch Code
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Produk Digital, Source Code & Modul Siap Pakai
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Percepat development produk Anda hingga 10x lipat dengan boilerplate arsitektur enterprise teruji, payment adapter, dan solusi backend terverifikasi.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">✓ 100% Full Source Code</span>
            <span className="flex items-center gap-1.5">✓ Support Deployment cPanel & Docker</span>
            <span className="flex items-center gap-1.5">✓ Lisensi Komersial Seumur Hidup</span>
          </div>
        </div>
      </section>

      {/* Filter Category */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredProducts.map(p => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all hover:shadow-md p-6 flex flex-col justify-between"
          >
            {/* Image Thumbnail with Direct Link */}
            <a href={`/product/?slug=${p.slug || p.id}`} className="block relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 mb-4 group cursor-pointer">
              <img
                src={p.thumbnail || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold rounded-lg shadow-sm">
                  Lihat Detail ➔
                </span>
              </div>
            </a>

            <div>
              {/* Header Card */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                  {p.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {p.tag}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-snug hover:text-sky-600 transition cursor-pointer" onClick={() => setActiveModal(p)}>
                {p.name}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {p.description}
              </p>

              {/* Stack Badges */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.stack.map(st => (
                  <span key={st} className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-medium">
                    {st}
                  </span>
                ))}
              </div>

              {/* Key Features */}
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {p.features.slice(0, 3).map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price & Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 line-through">
                  Rp {p.originalPrice.toLocaleString("id-ID")}
                </span>
                <div className="text-lg font-extrabold text-slate-900">
                  Rp {p.price.toLocaleString("id-ID")}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/product/?slug=${p.slug || p.id}`}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Detail
                </a>
                <button
                  onClick={() => addToCart(p)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition active:scale-95 shadow-sm"
                >
                  + Keranjang
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Drawer Summary */}
      {cart.length > 0 && (
        <div id="cart" className="fixed bottom-6 right-6 z-40 bg-white rounded-2xl border border-slate-300 shadow-2xl p-5 w-96 max-w-[calc(100vw-3rem)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>🛒 Keranjang Belanja</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                {cart.reduce((a, b) => a + b.qty, 0)} item
              </span>
            </h3>
            <button onClick={() => setCart([])} className="text-xs text-rose-500 hover:underline">
              Kosongkan
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="truncate pr-2">
                  <p className="font-semibold text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-slate-500">Rp {item.product.price.toLocaleString("id-ID")} x {item.qty}</p>
                </div>
                <span className="font-bold text-slate-900 whitespace-nowrap">
                  Rp {(item.product.price * item.qty).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between items-center">
            <span className="text-xs text-slate-500">Total Tagihan:</span>
            <span className="font-extrabold text-base text-slate-900">
              Rp {totalCart.toLocaleString("id-ID")}
            </span>
          </div>

          <button
            onClick={() => alert("Checkout akan terhubung langsung ke Midtrans Snap / API Store SwitchCode!")}
            className="w-full mt-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 active:scale-95 transition"
          >
            Lanjut ke Pembayaran ➔
          </button>
        </div>
      )}

      {/* Modal Detail Produk */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-lg"
            >
              ✕
            </button>

            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
              {activeModal.category}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">{activeModal.name}</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{activeModal.description}</p>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Spesifikasi & Fitur:</h4>
              <ul className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {activeModal.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Tech Stack:</h4>
              <div className="flex flex-wrap gap-1">
                {activeModal.stack.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 line-through">
                  Rp {activeModal.originalPrice.toLocaleString("id-ID")}
                </span>
                <p className="text-xl font-black text-slate-900">
                  Rp {activeModal.price.toLocaleString("id-ID")}
                </p>
              </div>
              <button
                onClick={() => {
                  addToCart(activeModal);
                  setActiveModal(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
              >
                + Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
