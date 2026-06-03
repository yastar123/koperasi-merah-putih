import { useGetDashboardNasional } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Wallet, Clock, TrendingUp, Globe } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  highlight?: boolean;
}

function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, accentColor, highlight }: StatCardProps) {
  return (
    <Card className={`card-lift overflow-hidden border-l-4 ${accentColor} ${highlight ? "ring-1 ring-primary/10" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} shrink-0`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-black tracking-tight stat-value">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function SuperAdminDashboard() {
  const { data: dashboardData, isLoading } = useGetDashboardNasional();

  if (isLoading) {
    return (
      <div className="page-animate space-y-6">
        <div className="space-y-1">
          <div className="skeleton h-7 w-64" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-l-4 border-l-muted">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-9 w-9 rounded-xl" />
              </CardHeader>
              <CardContent>
                <div className="skeleton h-7 w-24 mb-2" />
                <div className="skeleton h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><div className="skeleton h-5 w-48" /></CardHeader>
          <CardContent><div className="skeleton h-[300px] w-full rounded-lg" /></CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <Globe className="h-12 w-12 text-muted-foreground/20 mb-3" />
        <p className="text-muted-foreground">Gagal memuat data dashboard.</p>
      </div>
    );
  }

  const activeRate = dashboardData.totalKoperasi > 0
    ? Math.round((dashboardData.koperasiAktif / dashboardData.totalKoperasi) * 100)
    : 0;

  return (
    <div className="page-animate space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight">Dashboard Nasional</h2>
        <p className="text-muted-foreground text-sm">
          Ringkasan data koperasi seluruh Indonesia · {activeRate}% koperasi aktif
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-in">
        <StatCard
          title="Total Koperasi"
          value={dashboardData.totalKoperasi}
          subtitle={`${dashboardData.koperasiAktif} aktif · ${dashboardData.totalKoperasi - dashboardData.koperasiAktif} nonaktif`}
          icon={Building2}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          accentColor="border-l-primary"
          highlight
        />
        <StatCard
          title="Menunggu Verifikasi"
          value={dashboardData.koperasiPending}
          subtitle="Perlu ditinjau segera"
          icon={Clock}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
          accentColor="border-l-yellow-400"
        />
        <StatCard
          title="Total Anggota"
          value={dashboardData.totalAnggota.toLocaleString("id-ID")}
          subtitle="Anggota terdaftar nasional"
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          accentColor="border-l-blue-400"
        />
        <StatCard
          title="Total Aset"
          value={formatRupiah(dashboardData.totalAset)}
          subtitle="Akumulasi aset nasional"
          icon={Wallet}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          accentColor="border-l-green-400"
        />
      </div>

      {/* Chart */}
      <Card className="card-lift">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Sebaran Koperasi per Provinsi</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Distribusi geografis koperasi aktif</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-lg">
            <TrendingUp className="h-3.5 w-3.5" />
            {dashboardData.totalKoperasi} total
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.sebaran} margin={{ top: 4, right: 4, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="provinsi"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <RechartsTooltip
                  cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                    padding: "8px 12px",
                  }}
                />
                <Bar
                  dataKey="jumlahKoperasi"
                  name="Jumlah Koperasi"
                  fill="hsl(var(--primary))"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
