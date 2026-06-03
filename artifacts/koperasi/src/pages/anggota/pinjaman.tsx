import { useAuth } from "@/hooks/use-auth";
import { useListPinjaman } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatDate, getStatusBadgeVariant } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AnggotaPinjaman() {
  const { user } = useAuth();

  const { data: pinjamanList, isLoading } = useListPinjaman(
    { anggotaId: user?.id },
    { query: { enabled: !!user?.id } }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pinjaman Saya</h2>
          <p className="text-muted-foreground">Lihat status pengajuan dan jadwal angsuran.</p>
        </div>
        <Button>Ajukan Pinjaman Baru</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal Pengajuan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tenor</TableHead>
                <TableHead>Sisa Hutang</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Memuat riwayat...</TableCell>
                </TableRow>
              ) : !pinjamanList || pinjamanList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Anda belum memiliki riwayat pinjaman.</TableCell>
                </TableRow>
              ) : (
                pinjamanList.map((pinjaman) => (
                  <TableRow key={pinjaman.id}>
                    <TableCell>{formatDate(pinjaman.tanggalPengajuan)}</TableCell>
                    <TableCell className="font-medium">{formatRupiah(pinjaman.jumlahPinjaman)}</TableCell>
                    <TableCell>{pinjaman.tenorBulan} bln</TableCell>
                    <TableCell className="text-red-600">{formatRupiah(pinjaman.sisaPinjaman || 0)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeVariant(pinjaman.status)}>
                        {pinjaman.status.toUpperCase()}
                      </Badge>
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
