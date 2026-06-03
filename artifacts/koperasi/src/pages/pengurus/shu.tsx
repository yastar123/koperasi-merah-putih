import { useAuth } from "@/hooks/use-auth";
import { useGetLaporanShu } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator } from "lucide-react";

export default function PengurusSHU() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear() - 1; // SHU is usually for previous year
  
  const { data: shu, isLoading } = useGetLaporanShu(
    { koperasiId: user?.koperasiId, tahun: currentYear },
    { query: { enabled: !!user?.koperasiId } }
  );

  if (isLoading) return <div className="p-8">Memuat kalkulasi SHU...</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sisa Hasil Usaha (SHU)</h2>
          <p className="text-muted-foreground">Kalkulasi dan distribusi SHU Tahun {currentYear}</p>
        </div>
      </div>

      {!shu ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-1">SHU Belum Dihitung</h3>
          <p className="text-sm text-muted-foreground mb-4">Laporan keuangan tahun {currentYear} belum ditutup atau SHU belum didistribusikan.</p>
        </Card>
      ) : (
        <>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total SHU Dibagikan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{formatRupiah(shu.totalShu)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi SHU per Anggota</CardTitle>
              <CardDescription>Berdasarkan porsi simpanan dan partisipasi belanja.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anggota</TableHead>
                    <TableHead className="text-right">Total Simpanan</TableHead>
                    <TableHead className="text-right">Partisipasi Belanja</TableHead>
                    <TableHead className="text-right font-bold text-primary">SHU Diterima</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shu.shuPerAnggota.map((anggota) => (
                    <TableRow key={anggota.anggotaId}>
                      <TableCell className="font-medium">{anggota.namaAnggota}</TableCell>
                      <TableCell className="text-right">{formatRupiah(anggota.totalSimpanan)}</TableCell>
                      <TableCell className="text-right">{formatRupiah(anggota.totalBelanja)}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{formatRupiah(anggota.bagianShu)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
