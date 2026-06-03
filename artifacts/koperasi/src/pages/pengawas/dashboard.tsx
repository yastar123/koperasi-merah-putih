import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats, useGetLaporanKeuangan } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { TrendingUp, TrendingDown, Landmark, Activity } from "lucide-react";

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
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="skeleton h-7 w-64" />
          <div className="skeleton h-4 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="skeleton h-80 rounded-xl" />
          <div className="skeleton h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats || !laporan) return null;

  const nplRate = stats.pinjamanAktif > 0
    ? ((stats.tunggakan / stats.pinjamanAktif) * 100)
    : 0;

  const isProfit = laporan.labaRugi >= 0;

  const pieData = [
    { name: "Total Simpanan", value: stats.totalSimpanan, color: "hsl(var(--primary))" },
    { name: "Pinjaman Aktif", value: stats.pinjamanAktif, color: "hsl(var(--chart-2))" },
  ];

  const statCards = [
    {
      title: "Total Aset",
      value: formatRupiah(laporan.totalAset),
      subtitle: `Tahun ${currentYear}`,
      accent: "border-l-purple-400",
      iconBg: "bg-purple-50",
      icon: Landmark,
      iconColor: "text-purple-600",
    },
    {
      title: "Pemasukan YTD",
      value: formatRupiah(laporan.totalPemasukan),
      subtitle: "Akumulasi tahun ini",
      accent: "border-l-green-400",
      iconBg: "bg-green-50",
      icon: TrendingUp,
      iconColor: "text-green-600",
      valueColor: "text-green-700",
    },
    {
      title: "Pengeluaran YTD",
      value: formatRupiah(laporan.totalPengeluaran),
      subtitle: "Akumulasi tahun ini",
      accent: "border-l-red-400",
      iconBg: "bg-red-50",
      icon: TrendingDown,
      iconColor: "text-red-500",
      valueColor: "text-red-600",
    },
    {
      title: "Laba / Rugi",
      value: formatRupiah(laporan.labaRugi),
      subtitle: isProfit ? "Koperasi untung" : "Koperasi rugi",
      accent: isProfit ? "border-l-green-400" : "border-l-red-400",
      iconBg: isProfit ? "bg-green-50" : "bg-red-50",
      icon: isProfit ? TrendingUp : TrendingDown,
      iconColor: isProfit ? "text-green-600" : "text-red-500",
      valueColor: isProfit ? "text-green-700" : "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Overview Kinerja Koperasi</h2>
          <p className="text-muted-foreground text-sm">Laporan keuangan & kesehatan koperasi</p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg font-medium self-start sm:self-auto">
          Tahun {currentYear}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-in">
        {statCards.map(card => (
          <Card key={card.title} className={`card-lift overflow-hidden border-l-4 ${card.accent}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg} shrink-0`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className={`text-2xl font-black stat-value ${card.valueColor || ""}`}>{card.value}</div>
              {card.subtitle && <p className="text-xs text-muted-foreground mt-1.5">{card.subtitle}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Portfolio chart */}
        <Card className="card-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Portofolio Dana</CardTitle>
            <p className="text-xs text-muted-foreground">Komposisi simpanan vs pinjaman</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => formatRupiah(Number(value))}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      fontSize: "13px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Health indicators */}
        <Card className="card-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Kesehatan Keuangan</CardTitle>
            <p className="text-xs text-muted-foreground">Indikator kinerja kunci</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {/* NPL ratio */}
            <div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-medium">Rasio NPL (Kredit Macet)</span>
                <span className={`font-bold text-sm px-2 py-0.5 rounded-md ${
                  nplRate > 5 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}>
                  {nplRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${nplRate > 5 ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(nplRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {nplRate <= 5 ? "✓ Dalam batas sehat (< 5%)" : "⚠ Melebihi batas sehat (> 5%)"}
              </p>
            </div>

            {/* Liquidity */}
            <div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-medium">Likuiditas (Simpanan : Pinjaman)</span>
                <span className="font-bold text-sm px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">
                  {stats.pinjamanAktif > 0
                    ? (stats.totalSimpanan / stats.pinjamanAktif).toFixed(2)
                    : "∞"}x
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      stats.pinjamanAktif > 0
                        ? (stats.totalSimpanan / stats.pinjamanAktif) * 50
                        : 100,
                      100
                    )}%`
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {stats.pinjamanAktif > 0 && stats.totalSimpanan / stats.pinjamanAktif >= 1.3
                  ? "✓ Likuiditas baik (≥ 1.3x)"
                  : "⚠ Perlu monitoring likuiditas"}
              </p>
            </div>

            {/* Profit margin */}
            <div className={`rounded-xl p-4 border ${isProfit ? "bg-green-50/50 border-green-100" : "bg-red-50/50 border-red-100"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Activity className={`h-4 w-4 ${isProfit ? "text-green-600" : "text-red-500"}`} />
                <span className="text-sm font-semibold">Status Keuangan Koperasi</span>
              </div>
              <p className={`text-2xl font-black ${isProfit ? "text-green-700" : "text-red-600"}`}>
                {isProfit ? "Sehat & Menguntungkan" : "Perlu Perhatian"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Selisih: {formatRupiah(Math.abs(laporan.labaRugi))} {isProfit ? "keuntungan" : "kerugian"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
