import { useAuth } from "@/hooks/use-auth";
import { useGetLaporanKeuangan } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

export default function PengurusKeuangan() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const { data: laporan, isLoading } = useGetLaporanKeuangan(
    { koperasiId: user?.koperasiId, tahun: currentYear },
    { query: { enabled: !!user?.koperasiId } }
  );

  if (isLoading) return <div className="p-8">Memuat laporan keuangan...</div>;
  if (!laporan) return <div className="p-8">Laporan tidak tersedia.</div>;

  const unitData = laporan.rincianUnit || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Laporan Keuangan</h2>
          <p className="text-muted-foreground">Tahun {currentYear}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(laporan.totalPemasukan)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(laporan.totalPengeluaran)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Laba/Rugi Bersih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${laporan.labaRugi >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {formatRupiah(laporan.labaRugi)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kontribusi Laba per Unit Usaha</CardTitle>
        </CardHeader>
        <CardContent>
          {unitData.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitData} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => formatRupiah(value).replace(',00', '')} />
                  <YAxis dataKey="namaUnit" type="category" />
                  <RechartsTooltip 
                    formatter={(value) => formatRupiah(Number(value))}
                    cursor={{fill: 'transparent'}}
                  />
                  <Legend />
                  <Bar dataKey="omzet" name="Omzet" fill="hsl(var(--primary)/0.5)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="labaUnit" name="Laba Bersih" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="text-center py-8 text-muted-foreground">Tidak ada data unit usaha.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
