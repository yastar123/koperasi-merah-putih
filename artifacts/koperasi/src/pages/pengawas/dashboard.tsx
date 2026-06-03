import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats, useGetLaporanKeuangan } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

export default function PengawasDashboard() {
  const { user } = useAuth();
  const koperasiId = user?.koperasiId;
  const currentYear = new Date().getFullYear();

  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats(
    { koperasiId: koperasiId! },
    { query: { enabled: !!koperasiId } }
  );

  const { data: laporan, isLoading: isLoadingLaporan } = useGetLaporanKeuangan(
    { koperasiId: koperasiId!, tahun: currentYear },
    { query: { enabled: !!koperasiId } }
  );

  if (isLoadingStats || isLoadingLaporan) {
    return <div className="flex h-full items-center justify-center p-8">Memuat data dashboard...</div>;
  }

  if (!stats || !laporan) return null;

  const pieData = [
    { name: "Total Simpanan", value: stats.totalSimpanan, color: "hsl(var(--primary))" },
    { name: "Pinjaman Aktif", value: stats.pinjamanAktif, color: "hsl(var(--chart-2))" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Overview Kinerja Koperasi</h2>
        <span className="text-sm text-muted-foreground">Tahun {currentYear}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(laporan.totalAset)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pemasukan YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(laporan.totalPemasukan)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(laporan.totalPengeluaran)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laba/Rugi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${laporan.labaRugi >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatRupiah(laporan.labaRugi)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Portofolio Dana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatRupiah(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kesehatan Keuangan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Rasio NPL (Kredit Macet)</span>
                <span className="font-medium">
                  {stats.pinjamanAktif > 0 ? ((stats.tunggakan / stats.pinjamanAktif) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${stats.tunggakan / stats.pinjamanAktif > 0.05 ? 'bg-red-500' : 'bg-green-500'}`} 
                  style={{ width: `${Math.min((stats.tunggakan / Math.max(stats.pinjamanAktif, 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
