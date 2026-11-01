import "./globals.css";

export const metadata = {
  title: "SwitchCode Store — Official Digital Marketplace & Code Boilerplates",
  description: "Official developer store by Switch Code. Source code, production APIs, and SaaS boilerplates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 antialiased">
        {/* Navigation Bar Clean Light */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  SC
                </span>
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  SwitchCode <span className="text-sky-600 font-semibold">Store</span>
                </span>
              </a>
              <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                Official Marketplace
              </span>
            </div>

            <nav className="flex items-center gap-4">
              <a href="https://switchcode.id" target="_blank" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                Company Profile
              </a>
              <a href="https://switchcode.id/news" target="_blank" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                News
              </a>
              <a href="/login/" className="text-xs sm:text-sm font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 hover:bg-sky-100 transition">
                Masuk / Daftar
              </a>
              <a
                href="#cart"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs sm:text-sm font-medium hover:bg-slate-800 transition shadow-sm"
              >
                <span>🛒 Cart</span>
                <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[11px] font-bold flex items-center justify-center">
                  0
                </span>
              </a>
            </nav>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-10 mt-16 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-semibold text-slate-800 text-sm mb-1">PT Switch Code Teknologi</p>
            <p>Solusi Digital & Platform Ekosistem Pengembang Indonesia</p>
            <p className="mt-4 text-slate-400">© 2026 SwitchCode Store. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
