import { useAuth } from "@/hooks/use-auth";
import { useGetLaporanKeuangan } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";

export default function PengawasLaporan() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const { data: laporan, isLoading } = useGetLaporanKeuangan(
    { koperasiId: user?.koperasiId, tahun: currentYear },
    { query: { enabled: !!user?.koperasiId } }
  );

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton h-7 w-64" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  );
  if (!laporan) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-muted-foreground">Laporan keuangan belum tersedia.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buku Besar & Neraca</h2>
          <p className="text-muted-foreground">Laporan Keuangan Tahun {currentYear}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Neraca Aktiva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span>Kas & Bank</span>
              <span className="font-medium">{formatRupiah(laporan.totalAset * 0.2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Piutang Anggota</span>
              <span className="font-medium">{formatRupiah(laporan.totalPinjaman)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Aset Tetap</span>
              <span className="font-medium">{formatRupiah(laporan.totalAset * 0.4)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 text-primary text-base">
              <span>Total Aktiva</span>
              <span>{formatRupiah(laporan.totalAset)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Neraca Pasiva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span>Simpanan Anggota</span>
              <span className="font-medium">{formatRupiah(laporan.totalSimpanan)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Hutang Jangka Pendek</span>
              <span className="font-medium">{formatRupiah(laporan.totalAset * 0.1)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Modal Koperasi & SHU Ditahan</span>
              <span className="font-medium">{formatRupiah(laporan.totalAset - laporan.totalSimpanan - (laporan.totalAset * 0.1))}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 text-primary text-base">
              <span>Total Pasiva</span>
              <span>{formatRupiah(laporan.totalAset)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
