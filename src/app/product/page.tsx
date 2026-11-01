"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Check, 
  Shield, 
  Terminal, 
  Layers, 
  Sparkles,
  AlertCircle
} from "lucide-react";

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug") || searchParams.get("id");

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carousel state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api-store.switchcode.id/api";

  useEffect(() => {
    if (!slug) {
      setError("Slug produk tidak ditemukan.");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await fetch(`${apiUrl}/products/${slug}`);
        const d = await res.json();
        if (d.success && d.data) {
          setProduct(d.data);
        } else {
          // Fallback fetch all to find match
          const allRes = await fetch(`${apiUrl}/products`);
          const allData = await allRes.json();
          const items = allData.data?.data || allData.data || [];
          const found = items.find((p: any) => p.slug === slug || String(p.id) === String(slug));
          if (found) {
            setProduct(found);
          } else {
            setError("Produk tidak ditemukan di katalog.");
          }
        }
      } catch (err: any) {
        setError("Gagal memuat detail produk.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
          <span>Memuat detail produk...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Produk Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mb-6">{error || "Halaman yang Anda tuju tidak valid."}</p>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </button>
      </div>
    );
  }

  // Siapkan daftar gambar untuk carousel
  const galleryImages: string[] = [];
  if (product.thumbnail_url || product.thumbnail) {
    galleryImages.push(product.thumbnail_url || product.thumbnail);
  }
  if (product.images && product.images.length > 0) {
    product.images.forEach((img: any) => {
      const u = img.full_url || img.image_url;
      if (u && !galleryImages.includes(u)) {
        galleryImages.push(u);
      }
    });
  }

  // Fallback demo mockups jika gambar belum diupload admin
  if (galleryImages.length === 0) {
    galleryImages.push("https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop");
    galleryImages.push("https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop");
    galleryImages.push("https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop");
  }

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Kalkulasi total harga termasuk topping yang dicentang
  const basePrice = Number(product.base_price || 0);
  const toppingsPrice = (product.modules || [])
    .filter((m: any) => selectedToppings.includes(m.id) || m.is_required)
    .reduce((sum: number, m: any) => sum + Number(m.price || 0), 0);
  const finalPrice = basePrice + toppingsPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Semua Produk</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Interactive Carousel Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md group">
            <img
              src={galleryImages[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

            {/* Carousel Navigation Buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center backdrop-blur-xs shadow-sm transition opacity-80 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center backdrop-blur-xs shadow-sm transition opacity-80 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Counter Badge */}
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-medium tracking-wider">
                  {activeImageIndex + 1} / {galleryImages.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Bar */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 sm:w-24 aspect-video rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                    activeImageIndex === idx ? "border-slate-900 ring-2 ring-slate-900/20" : "border-slate-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mt-6">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Deskripsi Lengkap & Spesifikasi</span>
            </h2>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description || product.summary || "Deskripsi lengkap tidak tersedia."}
            </div>
          </div>
        </div>

        {/* Right: Buy Card & Meta Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs sticky top-24">
            {/* Badges Multi Kategori */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.categories && product.categories.length > 0 ? (
                product.categories.map((c: any) => (
                  <span key={c.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                    🏷️ {c.name}
                  </span>
                ))
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  {product.category || "General"}
                </span>
              )}

              {product.showcases && product.showcases.length > 0 && (
                product.showcases.map((s: any) => (
                  <span key={s.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    ⭐ {s.name}
                  </span>
                ))
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.summary}
            </p>

            {/* Price Box */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Harga Total (Termasuk Topping)</span>
              <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                Rp {finalPrice.toLocaleString("id-ID")}
              </div>
              {toppingsPrice > 0 && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Harga dasar: Rp {basePrice.toLocaleString("id-ID")} + Topping: Rp {toppingsPrice.toLocaleString("id-ID")}
                </div>
              )}
            </div>

            {/* SELEKSI TOPPING / ADD-ON KHUSUS PRODUK INI */}
            {product.modules && product.modules.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🍦 Pilihan Topping & Add-on</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Kustomisasi Paket</span>
                </div>

                <div className="space-y-2">
                  {product.modules.map((m: any) => {
                    const isChecked = selectedToppings.includes(m.id) || m.is_required;
                    return (
                      <label
                        key={m.id}
                        className={`flex items-start justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked 
                            ? "border-sky-500 bg-sky-50/40" 
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={m.is_required}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedToppings([...selectedToppings, m.id]);
                              } else {
                                setSelectedToppings(selectedToppings.filter((id) => id !== m.id));
                              }
                            }}
                            className="mt-0.5 rounded text-slate-900"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{m.name}</span>
                              {m.is_required && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                                  Wajib
                                </span>
                              )}
                            </div>
                            {m.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0 ml-2">
                          +Rp {Number(m.price).toLocaleString("id-ID")}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Purchase CTA */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer ${
                  added 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-900 hover:bg-slate-800 text-white active:scale-98"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Ditambahkan ke Keranjang!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Beli Sekarang / + Keranjang</span>
                  </>
                )}
              </button>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Jaminan 100% Full Source Code & Lisensi Resmi</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Terminal className="w-4 h-4 text-sky-600" />
                  <span>Siap Deploy ke cPanel Hosting / Docker Container</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
          <span>Memuat halaman produk...</span>
        </div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}
