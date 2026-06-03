import { useListTransaksi } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/format";

export default function OperatorTransaksi() {
  const unitUsahaId = 1; // Example
  const { data: transaksiList, isLoading } = useListTransaksi({ unitUsahaId });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h2>
          <p className="text-muted-foreground">Daftar penjualan harian kasir.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>No. Ref</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="text-right">Total Transaksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Memuat transaksi...</TableCell>
                </TableRow>
              ) : !transaksiList || transaksiList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Belum ada transaksi hari ini.</TableCell>
                </TableRow>
              ) : (
                transaksiList.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.tanggal)}</TableCell>
                    <TableCell className="font-mono text-xs">TRX-{tx.id.toString().padStart(6, '0')}</TableCell>
                    <TableCell>{tx.namaAnggota || "Umum"}</TableCell>
                    <TableCell className="text-right font-medium text-primary">{formatRupiah(tx.totalHarga)}</TableCell>
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
