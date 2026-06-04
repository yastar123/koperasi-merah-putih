import { useAuth } from "@/hooks/use-auth";
import { useListSimpanan, useGetSaldoAnggota } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

export default function AnggotaSimpanan() {
  const { user } = useAuth();
  
  const { data: saldo } = useGetSaldoAnggota(
    user?.id || 0,
    { query: { queryKey: [], enabled: !!user?.id } }
  );

  const { data: simpananList, isLoading } = useListSimpanan(
    { anggotaId: user?.id ?? undefined },
    { query: { queryKey: [], enabled: !!user?.id } }
  );

  return (
    <div className="page-animate space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buku Simpanan</h2>
          <p className="text-muted-foreground">Pantau saldo dan riwayat simpanan Anda.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-in">
        <Card className="card-lift overflow-hidden border-l-4 border-l-primary sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Simpanan
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-black stat-value text-primary">{formatRupiah(saldo?.totalSimpanan || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Keseluruhan simpanan Anda</p>
          </CardContent>
        </Card>

        <Card className="card-lift overflow-hidden border-l-4 border-l-blue-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Simpanan Pokok</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 shrink-0">
              <Wallet className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-xl font-black stat-value">{formatRupiah(saldo?.simpananPokok || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Dibayar saat pertama masuk</p>
          </CardContent>
        </Card>

        <Card className="card-lift overflow-hidden border-l-4 border-l-green-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Simpanan Wajib</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 shrink-0">
              <Wallet className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-xl font-black stat-value">{formatRupiah(saldo?.simpananWajib || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Dibayar rutin tiap bulan</p>
          </CardContent>
        </Card>

        <Card className="card-lift overflow-hidden border-l-4 border-l-purple-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Simpanan Sukarela</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 shrink-0">
              <Wallet className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-xl font-black stat-value">{formatRupiah(saldo?.simpananSukarela || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Tabungan fleksibel Anda</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="table-responsive"><Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><div className="skeleton h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !simpananList || simpananList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Belum ada riwayat simpanan.</TableCell>
                </TableRow>
              ) : (
                simpananList.map((simpanan) => (
                  <TableRow key={simpanan.id}>
                    <TableCell>{formatDate(simpanan.tanggal)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {simpanan.jenis}
                      </Badge>
                    </TableCell>
                    <TableCell>{simpanan.keterangan || "-"}</TableCell>
                    <TableCell className={`text-right font-medium ${simpanan.jenis === 'penarikan' ? 'text-red-600' : 'text-green-600'}`}>
                      {simpanan.jenis === 'penarikan' ? '-' : '+'}{formatRupiah(simpanan.jumlah)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table></div>
        </CardContent>
      </Card>
    </div>
  );
}
