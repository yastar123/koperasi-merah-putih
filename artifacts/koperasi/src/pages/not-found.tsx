import { Link } from "wouter";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md fade-in-up">
        <div className="relative inline-flex">
          <div className="text-[8rem] font-black text-muted/40 leading-none select-none tracking-tighter">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-black text-2xl">MP</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">Halaman Tidak Ditemukan</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Halaman yang Anda cari tidak tersedia atau telah dipindahkan. Pastikan URL sudah benar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-5 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Halaman Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
}
