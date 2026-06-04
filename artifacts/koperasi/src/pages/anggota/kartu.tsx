import { useAuth } from "@/hooks/use-auth";
import { useCurrentAnggota } from "@/hooks/use-current-anggota";
import { useGetSaldoAnggota } from "@workspace/api-client-react";
import { formatRupiah, formatDate } from "@/lib/format";
import { QRCodeSVG } from "qrcode.react";
import { Wallet, Calendar, User, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnggotaKartu() {
  const { user } = useAuth();
  const { anggota, anggotaId, isLoading: isLoadingAnggota } = useCurrentAnggota();

  const { data: saldo } = useGetSaldoAnggota(
    anggotaId ?? 0,
    { query: { queryKey: [], enabled: !!anggotaId } }
  );

  if (isLoadingAnggota) {
    return (
      <div className="page-animate flex flex-col items-center gap-6 py-4">
        <div className="text-center space-y-2">
          <div className="skeleton h-7 w-64 mx-auto" />
          <div className="skeleton h-4 w-80 mx-auto" />
        </div>
        <div className="skeleton w-full max-w-sm h-52 rounded-2xl" />
        <div className="skeleton w-full max-w-sm h-32 rounded-2xl" />
      </div>
    );
  }

  if (!anggota) {
    return (
      <div className="page-animate flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <div>
          <h3 className="text-base font-bold">Data Anggota Belum Tersedia</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Akun Anda belum terdaftar sebagai anggota koperasi. Hubungi pengurus untuk pendaftaran.
          </p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-animate flex flex-col items-center gap-6 py-2 max-w-sm mx-auto print-kartu">
      {/* Header */}
      <div className="text-center space-y-1 w-full print:hidden">
        <h2 className="text-2xl font-black tracking-tight">Kartu Anggota Digital</h2>
        <p className="text-muted-foreground text-sm">
          Tunjukkan QR code ini saat bertransaksi di unit usaha koperasi
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 gap-2"
          onClick={handlePrint}
        >
          <Download className="h-3.5 w-3.5" />
          Unduh / Cetak Kartu
        </Button>
      </div>

      {/* Card */}
      <div className="w-full fade-in-up" style={{ perspective: "1000px" }}>
        <div className="member-card relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: "200px" }}>
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-primary to-red-900" />

          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />

          {/* Card pattern */}
          <div className="absolute inset-0 opacity-[0.04]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="card-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#card-grid)" />
            </svg>
          </div>

          {/* Card content */}
          <div className="relative z-10 p-6">
            {/* Top row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white font-black text-sm">
                  MP
                </div>
                <div>
                  <div className="text-white font-bold text-sm leading-tight">Koperasi</div>
                  <div className="text-white/60 text-[10px] tracking-[0.15em] uppercase">Merah Putih</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-white/50 uppercase tracking-widest font-medium">Kartu Anggota</div>
                <div className="text-white/80 text-xs font-semibold mt-0.5">Digital ID</div>
              </div>
            </div>

            {/* Main info row */}
            <div className="flex items-end gap-4">
              {/* QR Code */}
              <div className="bg-white p-2.5 rounded-xl shrink-0 shadow-lg">
                <QRCodeSVG
                  value={`KMP:${anggota.nomorAnggota}:${anggota.nama}`}
                  size={80}
                  level="H"
                  fgColor="#1a1a1a"
                />
              </div>

              {/* Member info */}
              <div className="flex-1 min-w-0">
                <div className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Nama Anggota</div>
                <div className="text-white font-bold text-lg leading-tight truncate">{anggota.nama}</div>

                <div className="mt-3 text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Nomor Anggota</div>
                <div className="text-white font-mono font-semibold text-sm tracking-wider">{anggota.nomorAnggota}</div>

                <div className="mt-2 inline-flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5 text-[10px] text-white/80 font-medium">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  {anggota.status === "aktif" ? "Anggota Aktif" : anggota.status === "pending" ? "Menunggu Verifikasi" : "Anggota"}
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
              <div>
                <div className="text-white/50 text-[9px] uppercase tracking-widest">Bergabung Sejak</div>
                <div className="text-white/90 text-xs font-semibold mt-0.5">
                  {formatDate(anggota.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/50 text-[9px] uppercase tracking-widest">Tahun {new Date().getFullYear()}</div>
                <div className="text-white/80 text-xs font-medium mt-0.5">Valid</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saldo summary card */}
      {saldo && (
        <div className="w-full bg-card border border-border/60 rounded-2xl overflow-hidden card-lift fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Saldo Simpanan</span>
          </div>
          <div className="px-5 py-4">
            <div className="stat-value text-2xl font-black text-primary mb-4">
              {formatRupiah(saldo.totalSimpanan)}
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { label: "Simpanan Pokok", value: saldo.simpananPokok || 0 },
                { label: "Simpanan Wajib", value: saldo.simpananWajib || 0 },
                { label: "Simpanan Sukarela", value: saldo.simpananSukarela || 0 },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold tabular-nums">{formatRupiah(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info section */}
      <div className="w-full grid grid-cols-2 gap-3 fade-in-up" style={{ animationDelay: "200ms" }}>
        <div className="bg-muted/40 rounded-xl p-4 border border-border/40">
          <User className="h-4 w-4 text-muted-foreground mb-2" />
          <div className="text-xs text-muted-foreground">No. Anggota</div>
          <div className="font-mono font-bold text-sm mt-0.5 truncate">{anggota.nomorAnggota}</div>
        </div>
        <div className="bg-muted/40 rounded-xl p-4 border border-border/40">
          <Calendar className="h-4 w-4 text-muted-foreground mb-2" />
          <div className="text-xs text-muted-foreground">Tanggal Bergabung</div>
          <div className="font-semibold text-sm mt-0.5">{formatDate(anggota.createdAt)}</div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground/60 px-4">
        Kartu ini adalah identitas resmi keanggotaan Anda di Koperasi Merah Putih. Jaga kerahasiaannya.
      </p>
    </div>
  );
}
