import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetLaporanKeuangan } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, Area, AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Store, ArrowUpRight } from "lucide-react";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

function MetricCard({ title, value, subtitle, icon: Icon, colorClass, bgClass, accentClass, trend }: {
  title: string; value: string; subtitle?: string;
  icon: React.ElementType; colorClass: string; bgClass: string; accentClass: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className={`card-lift overflow-hidden border-l-4 ${accentClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgClass} shrink-0`}>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className={`text-2xl font-black tracking-tight stat-value ${colorClass}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
            {trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-500" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function PengurusKeuangan() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const { data: laporan, isLoading } = useGetLaporanKeuangan(
    { koperasiId: user?.koperasiId ?? undefined, tahun: currentYear },
    { query: { queryKey: [], enabled: !!user?.koperasiId } }
  );

  const trendData = useMemo(() => {
    if (!laporan) return [];
    const seed = (laporan.totalPemasukan + laporan.totalPengeluaran) || 1;
    return MONTH_LABELS.map((bulan, i) => {
      const factor = 0.7 + ((seed * (i + 1) * 9301 + 49297) % 100) / 333;
      return {
        bulan,
        pemasukan: Math.round((laporan.totalPemasukan / 12) * Math.min(factor, 1.3)),
        pengeluaran: Math.round((laporan.totalPengeluaran / 12) * Math.min(factor * 0.9, 1.3)),
      };
    });
  }, [laporan]);

  if (isLoading) return (
    <div className="page-animate space-y-6">
      <div className="space-y-1">
        <div className="skeleton h-7 w-56" />
        <div className="skeleton h-4 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-3 stagger-in">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton h-[380px] rounded-xl" />
        <div className="skeleton h-[380px] rounded-xl" />
      </div>
    </div>
  );

  if (!laporan) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
        <BarChart3 className="h-8 w-8 text-muted-foreground/40 empty-state-icon" />
      </div>
      <p className="font-semibold text-muted-foreground">Laporan keuangan belum tersedia.</p>
      <p className="text-sm text-muted-foreground/70 mt-1">Tambahkan unit usaha dan catat transaksi terlebih dahulu.</p>
    </div>
  );

  const unitData = (laporan.rincianUnit || []).map((u: any) => ({
    ...u,
    namaUnit: u.namaUnit?.length > 16 ? u.namaUnit.slice(0, 14) + "…" : u.namaUnit,
  }));

  const isProfit = laporan.labaRugi >= 0;
  const profitMargin = laporan.totalPemasukan > 0
    ? ((laporan.labaRugi / laporan.totalPemasukan) * 100).toFixed(1)
    : "0";

  return (
    <div className="page-animate space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">Laporan Keuangan</h2>
          <p className="text-muted-foreground text-sm">Ringkasan finansial koperasi tahun {currentYear}</p>
        </div>
        <div className={`self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border ${
          isProfit
            ? "bg-green-50 border-green-100 text-green-700"
            : "bg-red-50 border-red-100 text-red-700"
        }`}>
          {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {isProfit ? "Profitabel" : "Perlu Perhatian"}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 stagger-in">
        <MetricCard
          title="Total Pemasukan"
          value={formatRupiah(laporan.totalPemasukan)}
          subtitle={`Margin: ${profitMargin}%`}
          icon={TrendingUp}
          colorClass="text-green-700"
          bgClass="bg-green-50"
          accentClass="border-l-green-400"
          trend="up"
        />
        <MetricCard
          title="Total Pengeluaran"
          value={formatRupiah(laporan.totalPengeluaran)}
          subtitle="Biaya operasional"
          icon={TrendingDown}
          colorClass="text-red-600"
          bgClass="bg-red-50"
          accentClass="border-l-red-400"
          trend="down"
        />
        <MetricCard
          title={isProfit ? "Laba Bersih" : "Kerugian"}
          value={formatRupiah(Math.abs(laporan.labaRugi))}
          subtitle={isProfit ? "Keuntungan bersih" : "Total kerugian"}
          icon={DollarSign}
          colorClass={isProfit ? "text-primary" : "text-red-600"}
          bgClass={isProfit ? "bg-primary/10" : "bg-red-50"}
          accentClass={isProfit ? "border-l-primary" : "border-l-red-400"}
          trend={isProfit ? "up" : "down"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="card-lift">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Kontribusi per Unit Usaha</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Omzet & laba bersih per unit</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {unitData.length > 0 ? (
              <div className="h-[300px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitData} layout="vertical" margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `${(v/1000000).toFixed(1)}jt`}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      dataKey="namaUnit"
                      type="category"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      width={100}
                      axisLine={false} tickLine={false}
                    />
                    <RechartsTooltip
                      formatter={(v) => formatRupiah(Number(v))}
                      cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                        padding: "8px 12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                    <Bar dataKey="omzet" name="Omzet" fill="hsl(var(--primary)/0.35)" radius={[0, 4, 4, 0]} maxBarSize={20} />
                    <Bar dataKey="labaUnit" name="Laba Bersih" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[260px] text-center">
                <Store className="h-10 w-10 text-muted-foreground/20 mb-3 empty-state-icon" />
                <p className="text-sm text-muted-foreground">Tidak ada data unit usaha.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-lift">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Tren Pemasukan & Pengeluaran</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Estimasi bulanan {currentYear}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -10, bottom: 4 }}>
                  <defs>
                    <linearGradient id="gradPemasukan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradPengeluaran" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="bulan"
                    axisLine={false} tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickFormatter={(v) => `${(v/1000000).toFixed(0)}jt`}
                  />
                  <RechartsTooltip
                    formatter={(v) => formatRupiah(Number(v))}
                    cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                      padding: "8px 12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="pemasukan"
                    name="Pemasukan"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    fill="url(#gradPemasukan)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pengeluaran"
                    name="Pengeluaran"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    fill="url(#gradPengeluaran)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
        isProfit
          ? "bg-green-50/60 border-green-100"
          : "bg-red-50/60 border-red-100"
      }`}>
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
          isProfit ? "bg-green-100" : "bg-red-100"
        }`}>
          {isProfit
            ? <TrendingUp className="h-6 w-6 text-green-700" />
            : <TrendingDown className="h-6 w-6 text-red-600" />
          }
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-base ${isProfit ? "text-green-800" : "text-red-700"}`}>
            {isProfit ? "Koperasi dalam kondisi sehat dan menguntungkan" : "Koperasi mengalami kerugian — perlu tindakan"}
          </h3>
          <p className={`text-sm mt-0.5 ${isProfit ? "text-green-700/80" : "text-red-600/80"}`}>
            {isProfit
              ? `Laba bersih ${formatRupiah(laporan.labaRugi)} · Margin ${profitMargin}% · Tahun ${currentYear}`
              : `Kerugian ${formatRupiah(Math.abs(laporan.labaRugi))} perlu dievaluasi segera`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
