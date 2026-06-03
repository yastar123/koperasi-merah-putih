import { useGetPinjaman, useListAngsuran } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant, formatDate, formatRupiah } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PengurusPinjamanDetail() {
  const { id } = useParams();
  const pinjamanId = Number(id);

  const { data: pinjaman, isLoading: loadingPinjaman } = useGetPinjaman(
    pinjamanId,
    { query: { enabled: !!pinjamanId } }
  );

  const { data: angsuranList, isLoading: loadingAngsuran } = useListAngsuran(
    { pinjamanId },
    { query: { enabled: !!pinjamanId } }
  );

  if (loadingPinjaman) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="skeleton h-9 w-9 rounded-md" />
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton md:col-span-2 h-64 rounded-xl" />
      </div>
    </div>
  );
  if (!pinjaman) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-muted-foreground">Pinjaman tidak ditemukan.</p>
      <Link href="/pengurus/pinjaman" className="text-primary hover:underline mt-2 text-sm">← Kembali ke daftar</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pengurus/pinjaman" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Detail Pinjaman</h2>
          <p className="text-muted-foreground">{pinjaman.namaAnggota}</p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className={getStatusBadgeVariant(pinjaman.status)}>
            {pinjaman.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informasi Pinjaman</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Jumlah Pinjaman</span>
              <p className="font-bold text-lg text-primary">{formatRupiah(pinjaman.jumlahPinjaman)}</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">Sisa Pinjaman</span>
              <p className="font-bold text-lg text-red-600">{formatRupiah(pinjaman.sisaPinjaman || 0)}</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">Bunga</span>
              <p className="font-medium">{pinjaman.bungaPersen}%</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">Tenor</span>
              <p className="font-medium">{pinjaman.tenorBulan} Bulan</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">Angsuran per Bulan</span>
              <p className="font-medium">{formatRupiah(pinjaman.angsuranPerBulan || 0)}</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">Tanggal Pengajuan</span>
              <p className="font-medium">{formatDate(pinjaman.tanggalPengajuan)}</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">Tujuan Pinjaman</span>
              <p className="font-medium">{pinjaman.tujuan || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Jadwal Angsuran</CardTitle>
            <CardDescription>Daftar tagihan bulanan untuk pinjaman ini.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tanggal Bayar</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAngsuran ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Memuat jadwal...</TableCell>
                  </TableRow>
                ) : !angsuranList || angsuranList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada jadwal angsuran.</TableCell>
                  </TableRow>
                ) : (
                  angsuranList.map(angsuran => (
                    <TableRow key={angsuran.id}>
                      <TableCell className="font-medium">Ke-{angsuran.periodeKe}</TableCell>
                      <TableCell>{formatDate(angsuran.tanggalJatuhTempo)}</TableCell>
                      <TableCell>{formatRupiah(angsuran.jumlahAngsuran)}</TableCell>
                      <TableCell>{formatDate(angsuran.tanggalBayar) || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          angsuran.status === "lunas" ? "bg-green-100 text-green-800" :
                          angsuran.status === "terlambat" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {angsuran.status.toUpperCase()}
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
    </div>
  );
}
