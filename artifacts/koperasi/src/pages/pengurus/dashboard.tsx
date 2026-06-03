import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats, useGetAktivitasTerbaru, useGetPinjamanJatuhTempo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, CreditCard, Activity, AlertTriangle } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";

export default function PengurusDashboard() {
  const { user } = useAuth();
  const koperasiId = user?.koperasiId;

  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats(
    { koperasiId: koperasiId! },
    { query: { enabled: !!koperasiId } }
  );

  const { data: aktivitas, isLoading: isLoadingAktivitas } = useGetAktivitasTerbaru(
    { koperasiId: koperasiId! },
    { query: { enabled: !!koperasiId } }
  );

  const { data: jatuhTempo, isLoading: isLoadingJatuhTempo } = useGetPinjamanJatuhTempo(
    { koperasiId: koperasiId! },
    { query: { enabled: !!koperasiId } }
  );

  if (isLoadingStats || isLoadingAktivitas || isLoadingJatuhTempo) {
    return <div className="flex h-full items-center justify-center p-8">Memuat data dashboard...</div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anggota Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.anggotaAktif}</div>
            <p className="text-xs text-muted-foreground">
              Dari total {stats.totalAnggota} terdaftar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Simpanan</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(stats.totalSimpanan)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pinjaman Aktif</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(stats.pinjamanAktif)}</div>
            <p className="text-xs text-muted-foreground text-red-500 flex items-center mt-1">
              {stats.tunggakan > 0 && (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1 inline" />
                  {formatRupiah(stats.tunggakan)} tunggakan
                </>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Omzet Bulan Ini</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(stats.omzetBulanIni)}</div>
            <p className="text-xs text-muted-foreground">
              Semua unit usaha
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pinjaman Jatuh Tempo Terdekat</CardTitle>
          </CardHeader>
          <CardContent>
            {jatuhTempo && jatuhTempo.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Sisa</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jatuhTempo.slice(0, 5).map((pinjaman) => (
                    <TableRow key={pinjaman.id}>
                      <TableCell className="font-medium">
                        <Link href={`/pengurus/pinjaman/${pinjaman.id}`} className="hover:underline text-primary">
                          {pinjaman.namaAnggota}
                        </Link>
                      </TableCell>
                      <TableCell>{formatRupiah(pinjaman.sisaPinjaman || 0)}</TableCell>
                      <TableCell className="text-red-500">{formatDate(pinjaman.tanggalJatuhTempo)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">Tidak ada pinjaman jatuh tempo dalam waktu dekat.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aktivitas && aktivitas.length > 0 ? (
                aktivitas.map((item) => (
                  <div key={item.id} className="flex flex-col gap-1 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm">{item.deskripsi}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{item.namaUser || "Sistem"}</span>
                      <span className="mx-1">•</span>
                      <span>{formatDate(item.waktu)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">Belum ada aktivitas.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
