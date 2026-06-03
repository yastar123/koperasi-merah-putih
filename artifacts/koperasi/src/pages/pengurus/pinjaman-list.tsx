import { useAuth } from "@/hooks/use-auth";
import { useListPinjaman, useSetujuiPinjaman } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate, getStatusBadgeVariant } from "@/lib/format";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

export default function PengurusPinjamanList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: pinjamanList, isLoading, refetch } = useListPinjaman(
    { koperasiId: user?.koperasiId },
    { query: { enabled: !!user?.koperasiId } }
  );

  const setujuiPinjaman = useSetujuiPinjaman({
    mutation: {
      onSuccess: () => {
        toast({ title: "Status pinjaman diperbarui" });
        refetch();
      }
    }
  });

  const handleVerifikasi = (id: number, status: "disetujui" | "ditolak") => {
    setujuiPinjaman.mutate({ 
      id, 
      data: { status, catatanPengurus: status === "disetujui" ? "Disetujui otomatis" : "Ditolak pengurus" } 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Pinjaman</h2>
          <p className="text-muted-foreground">Kelola pengajuan pinjaman anggota.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal Pengajuan</TableHead>
                <TableHead>Anggota</TableHead>
                <TableHead className="text-right">Jumlah Pinjaman</TableHead>
                <TableHead>Tenor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Memuat data...</TableCell>
                </TableRow>
              ) : !pinjamanList || pinjamanList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Tidak ada pinjaman.</TableCell>
                </TableRow>
              ) : (
                pinjamanList.map((pinjaman) => (
                  <TableRow key={pinjaman.id}>
                    <TableCell>{formatDate(pinjaman.tanggalPengajuan)}</TableCell>
                    <TableCell className="font-medium">{pinjaman.namaAnggota}</TableCell>
                    <TableCell className="text-right">{formatRupiah(pinjaman.jumlahPinjaman)}</TableCell>
                    <TableCell>{pinjaman.tenorBulan} Bulan</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeVariant(pinjaman.status)}>
                        {pinjaman.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {pinjaman.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleVerifikasi(pinjaman.id, "disetujui")}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleVerifikasi(pinjaman.id, "ditolak")}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Link href={`/pengurus/pinjaman/${pinjaman.id}`} className="text-primary hover:underline text-sm font-medium">
                          Detail
                        </Link>
                      )}
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
