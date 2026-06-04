import { useAuth } from "@/hooks/use-auth";
import { useGetLaporanKeuangan } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { TrendingUp, TrendingDown, Scale, Landmark, FileBarChart } from "lucide-react";

function NeracaRow({ label, value, isTotal = false, isPositive }: {
  label: string; value: number; isTotal?: boolean; isPositive?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-2.5 border-b border-border/40 last:border-0 ${isTotal ? "border-t-2 border-border mt-1 pt-3" : ""}`}>
      <span className={`text-sm ${isTotal ? "font-black text-primary text-base" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className={`font-semibold tabular-nums ${isTotal ? "font-black text-primary text-base" : ""} ${isPositive === false ? "text-red-600" : ""}`}>
        {formatRupiah(value)}
      </span>
    </div>
  );
}

export default function PengawasLaporan() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const { data: laporan, isLoading } = useGetLaporanKeuangan(
    { koperasiId: user?.koperasiId ?? undefined, tahun: currentYear },
    { query: { queryKey: [], enabled: !!user?.koperasiId } }
  );

  if (isLoading) return (
    <div className="page-animate space-y-6">
      <div className="space-y-1">
        <div className="skeleton h-7 w-64" />
        <div className="skeleton h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3 stagger-in">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton h-[280px] rounded-xl" />
        <div className="skeleton h-[280px] rounded-xl" />
      </div>
    </div>
  );

  if (!laporan) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileBarChart className="h-12 w-12 text-muted-foreground/20 mb-3 empty-state-icon" />
      <p className="font-medium text-muted-foreground">Laporan keuangan belum tersedia.</p>
    </div>
  );

  const isProfit = laporan.labaRugi >= 0;

  return (
    <div className="page-animate space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">Buku Besar & Neraca</h2>
          <p className="text-muted-foreground text-sm">Laporan Keuangan Tahun {currentYear}</p>
        </div>
        <div className={`self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border ${
          isProfit
            ? "bg-green-50 border-green-100 text-green-700"
            : "bg-red-50 border-red-100 text-red-700"
        }`}>
          {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {isProfit ? "Koperasi Sehat" : "Perlu Evaluasi"}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3 stagger-in">
        <Card className="card-lift overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Aset
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Landmark className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-black stat-value text-primary">{formatRupiah(laporan.totalAset)}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Total aset koperasi</p>
          </CardContent>
        </Card>
        <Card className="card-lift overflow-hidden border-l-4 border-l-green-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Pemasukan
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-black stat-value text-green-700">{formatRupiah(laporan.totalPemasukan)}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Simpanan + omzet unit</p>
          </CardContent>
        </Card>
        <Card className={`card-lift overflow-hidden border-l-4 ${isProfit ? "border-l-blue-400" : "border-l-red-400"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Laba / Rugi
            </CardTitle>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isProfit ? "bg-blue-50" : "bg-red-50"}`}>
              <Scale className={`h-4 w-4 ${isProfit ? "text-blue-600" : "text-red-500"}`} />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className={`text-2xl font-black stat-value ${isProfit ? "text-blue-700" : "text-red-600"}`}>
              {isProfit ? "" : "−"}{formatRupiah(Math.abs(laporan.labaRugi))}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{isProfit ? "Keuntungan bersih" : "Total kerugian"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Neraca tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Aktiva */}
        <Card className="card-lift">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Neraca Aktiva</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Aset yang dimiliki koperasi</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0.5">
              <NeracaRow label="Piutang Anggota (Pinjaman Aktif)" value={laporan.totalPinjaman} />
              <NeracaRow label="Kas & Setara Kas" value={Math.max(0, laporan.totalSimpanan - laporan.totalPinjaman)} />
              <NeracaRow label="Pendapatan Unit Usaha" value={laporan.totalAset - laporan.totalSimpanan} />
              <NeracaRow label="Total Aktiva" value={laporan.totalAset} isTotal />
            </div>
          </CardContent>
        </Card>

        {/* Pasiva */}
        <Card className="card-lift">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Neraca Pasiva</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Kewajiban & modal koperasi</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0.5">
              <NeracaRow label="Kewajiban terhadap Anggota (Simpanan)" value={laporan.totalSimpanan} />
              <NeracaRow label="SHU Periode Berjalan" value={laporan.labaRugi > 0 ? laporan.labaRugi : 0} />
              <NeracaRow
                label="Modal & Cadangan Koperasi"
                value={laporan.totalAset - laporan.totalSimpanan - (laporan.labaRugi > 0 ? laporan.labaRugi : 0)}
              />
              <NeracaRow label="Total Pasiva" value={laporan.totalAset} isTotal />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5">
        <FileBarChart className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          Laporan keuangan ini merupakan ringkasan. Untuk laporan lengkap dan teraudit, silakan hubungi pengurus koperasi.
          Data per {currentYear}.
        </p>
      </div>
    </div>
  );
}
