import { useGetDashboardNasional } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function SuperAdminLaporan() {
  const { data: dashboardData, isLoading } = useGetDashboardNasional();

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton h-7 w-64" />
      <div className="skeleton h-56 rounded-xl" />
      <div className="skeleton h-64 rounded-xl" />
    </div>
  );

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Laporan Agregat Nasional</h2>
          <p className="text-muted-foreground">Ringkasan data seluruh koperasi di Indonesia.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Eksekutif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-muted-foreground">Total Koperasi Terdaftar</span>
              <span className="font-semibold text-lg">{dashboardData.totalKoperasi}</span>
            </div>
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-muted-foreground">Total Koperasi Aktif</span>
              <span className="font-semibold text-lg text-green-600">{dashboardData.koperasiAktif}</span>
            </div>
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-muted-foreground">Total Koperasi Menunggu Verifikasi</span>
              <span className="font-semibold text-lg text-yellow-600">{dashboardData.koperasiPending}</span>
            </div>
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-muted-foreground">Total Anggota Nasional</span>
              <span className="font-semibold text-lg">{dashboardData.totalAnggota.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-muted-foreground">Total Aset Koperasi Nasional</span>
              <span className="font-semibold text-lg text-primary">{formatRupiah(dashboardData.totalAset)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Rincian per Provinsi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Provinsi</th>
                  <th className="px-4 py-3 text-right">Jumlah Koperasi</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Jumlah Anggota</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.sebaran.map((prov, i) => (
                  <tr key={prov.provinsi} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{prov.provinsi}</td>
                    <td className="px-4 py-3 text-right">{prov.jumlahKoperasi}</td>
                    <td className="px-4 py-3 text-right">{prov.jumlahAnggota.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
