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
    { query: { enabled: !!user?.id } }
  );

  const { data: simpananList, isLoading } = useListSimpanan(
    { anggotaId: user?.id },
    { query: { enabled: !!user?.id } }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buku Simpanan</h2>
          <p className="text-muted-foreground">Pantau saldo dan riwayat simpanan Anda.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary text-primary-foreground md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 text-primary-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Total Simpanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(saldo?.totalSimpanan || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Simpanan Pokok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatRupiah(saldo?.simpananPokok || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Simpanan Wajib</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatRupiah(saldo?.simpananWajib || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Simpanan Sukarela</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatRupiah(saldo?.simpananSukarela || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
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
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
