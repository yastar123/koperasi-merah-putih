import { useAuth } from "@/hooks/use-auth";
import { useGetSaldoAnggota, useListPinjaman } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatRupiah, formatDate, getStatusBadgeVariant } from "@/lib/format";
import { Wallet, CreditCard, ArrowRight, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function AnggotaDashboard() {
  const { user } = useAuth();

  const { data: saldo, isLoading: isLoadingSaldo } = useGetSaldoAnggota(
    user?.id!,
    { query: { enabled: !!user?.id } }
  );
  const { data: pinjaman, isLoading: isLoadingPinjaman } = useListPinjaman(
    { anggotaId: user?.id },
    { query: { enabled: !!user?.id } }
  );

  if (isLoadingSaldo || isLoadingPinjaman) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="skeleton h-7 w-56" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 stagger-in">
          <div className="skeleton h-56 rounded-xl" />
          <div className="skeleton h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  const pinjamanAktif = pinjaman?.find(p => p.status === "disetujui" || p.status === "macet");
  const pinjamanPending = pinjaman?.find(p => p.status === "pending");

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight">
          Halo, {user?.nama?.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground text-sm">Ringkasan akun dan aktivitas Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 stagger-in">
        {/* Simpanan card */}
        <Card className="card-lift overflow-hidden border-l-4 border-l-green-400 bg-gradient-to-br from-background to-green-50/30">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Simpanan
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 shrink-0">
                <Wallet className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pb-4">
            <div className="stat-value text-3xl font-black text-green-700">
              {formatRupiah(saldo?.totalSimpanan || 0)}
            </div>

            <div className="space-y-1.5 text-sm border-t border-border/50 pt-3">
              {[
                { label: "Simpanan Pokok", value: saldo?.simpananPokok || 0 },
                { label: "Simpanan Wajib", value: saldo?.simpananWajib || 0 },
                { label: "Simpanan Sukarela", value: saldo?.simpananSukarela || 0 },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold tabular-nums">{formatRupiah(item.value)}</span>
                </div>
              ))}
            </div>

            <Link
              href="/anggota/simpanan"
              className="flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:underline transition-colors"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Lihat Riwayat Simpanan
              <ArrowRight className="h-3.5 w-3.5 ml-auto" />
            </Link>
          </CardContent>
        </Card>

        {/* Pinjaman card */}
        {pinjamanAktif ? (
          <Card className="card-lift overflow-hidden border-l-4 border-l-red-400 bg-gradient-to-br from-background to-red-50/20">
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pinjaman Aktif
                  </CardTitle>
                </div>
                <Badge variant="outline" className={getStatusBadgeVariant(pinjamanAktif.status)}>
                  {pinjamanAktif.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Sisa hutang</div>
                <div className="stat-value text-3xl font-black text-red-600">
                  {formatRupiah(pinjamanAktif.sisaPinjaman || 0)}
                </div>
              </div>

              <div className="space-y-1.5 text-sm border-t border-border/50 pt-3">
                {[
                  { label: "Total Pinjaman", value: formatRupiah(pinjamanAktif.jumlahPinjaman) },
                  { label: "Angsuran/Bulan", value: formatRupiah(pinjamanAktif.angsuranPerBulan || 0) },
                  { label: "Jatuh Tempo", value: formatDate(pinjamanAktif.tanggalJatuhTempo) },
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/anggota/pinjaman"
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Jadwal Angsuran
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </Link>
            </CardContent>
          </Card>
        ) : pinjamanPending ? (
          <Card className="card-lift overflow-hidden border-l-4 border-l-yellow-400">
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pengajuan Pinjaman
                </CardTitle>
                <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50">
                  Menunggu
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4 space-y-4">
              <div className="text-2xl font-black stat-value">
                {formatRupiah(pinjamanPending.jumlahPinjaman)}
              </div>
              <p className="text-sm text-muted-foreground">
                Pengajuan pinjaman Anda sedang ditinjau oleh pengurus koperasi. Kami akan segera memproses permohonan Anda.
              </p>
              <Link href="/anggota/pinjaman" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                Lihat Status <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-lift flex flex-col items-center justify-center text-center p-8 border-dashed border-2 hover:border-primary/30 transition-colors group">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 group-hover:bg-primary/5 flex items-center justify-center mb-4 transition-colors">
              <CreditCard className="h-7 w-7 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
            </div>
            <h3 className="text-base font-semibold mb-1">Tidak Ada Pinjaman Aktif</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-[200px]">Anda saat ini bebas dari tanggungan pinjaman</p>
            <Link
              href="/anggota/pinjaman"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
            >
              Ajukan Pinjaman
            </Link>
          </Card>
        )}
      </div>

      {/* Quick info */}
      {!pinjamanAktif && !pinjamanPending && (
        <Card className="card-lift bg-green-50/50 border-green-100">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">Status Keanggotaan Baik</p>
              <p className="text-xs text-green-600/80">Tidak ada tunggakan · Simpanan rutin berjalan</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
