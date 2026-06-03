import { useAuth } from "@/hooks/use-auth";
import { useGetSaldoAnggota, useListPinjaman } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatRupiah, formatDate, getStatusBadgeVariant } from "@/lib/format";
import { Wallet, CreditCard, ArrowRight } from "lucide-react";
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
    return <div className="flex h-full items-center justify-center p-8">Memuat profil...</div>;
  }

  const pinjamanAktif = pinjaman?.find(p => p.status === "disetujui" || p.status === "macet");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Selamat Datang, {user?.nama}</h2>
        <p className="text-muted-foreground">Ringkasan akun dan aktivitas Anda.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 text-primary-foreground">Total Simpanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{formatRupiah(saldo?.totalSimpanan || 0)}</div>
            <div className="space-y-1 text-sm opacity-90">
              <div className="flex justify-between">
                <span>Simpanan Pokok</span>
                <span>{formatRupiah(saldo?.simpananPokok || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Simpanan Wajib</span>
                <span>{formatRupiah(saldo?.simpananWajib || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Simpanan Sukarela</span>
                <span>{formatRupiah(saldo?.simpananSukarela || 0)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary-foreground/20">
              <Link href="/anggota/simpanan" className="flex items-center text-sm font-medium hover:underline">
                Lihat Riwayat Simpanan <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {pinjamanAktif ? (
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Pinjaman Aktif</CardTitle>
                <CardDescription>Sisa tagihan pinjaman Anda</CardDescription>
              </div>
              <Badge variant="outline" className={getStatusBadgeVariant(pinjamanAktif.status)}>
                {pinjamanAktif.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4 text-red-600">{formatRupiah(pinjamanAktif.sisaPinjaman || 0)}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Pinjaman</span>
                  <span>{formatRupiah(pinjamanAktif.jumlahPinjaman)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Angsuran per Bulan</span>
                  <span>{formatRupiah(pinjamanAktif.angsuranPerBulan || 0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Jatuh Tempo Berikutnya</span>
                  <span className="font-medium text-foreground">{formatDate(pinjamanAktif.tanggalJatuhTempo)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/anggota/pinjaman" className="flex items-center text-sm font-medium text-primary hover:underline">
                  Lihat Jadwal Angsuran <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-6 h-full border-dashed">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-1">Tidak Ada Pinjaman Aktif</h3>
            <p className="text-sm text-muted-foreground mb-4">Anda saat ini tidak memiliki tanggungan pinjaman.</p>
            <Link href="/anggota/pinjaman/ajukan" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Ajukan Pinjaman
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
