import { useGetDashboardNasional } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Wallet, Clock, TrendingUp } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

function StatCard({
  title, value, subtitle, icon: Icon, iconBg, iconColor, highlight,
}: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
  highlight?: boolean;
}) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${highlight ? "border-primary/30 bg-primary/5" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function SuperAdminDashboard() {
  const { data: dashboardData, isLoading } = useGetDashboardNasional();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-9 w-9 rounded-lg" />
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
        <p className="text-muted-foreground">Gagal memuat data dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Nasional</h2>
        <p className="text-muted-foreground text-sm">Ringkasan data koperasi seluruh Indonesia.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Koperasi"
          value={dashboardData.totalKoperasi}
          subtitle={`${dashboardData.koperasiAktif} aktif`}
          icon={Building2}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          highlight
        />
        <StatCard
          title="Menunggu Verifikasi"
          value={dashboardData.koperasiPending}
          subtitle="Perlu ditinjau segera"
          icon={Clock}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Total Anggota"
          value={dashboardData.totalAnggota.toLocaleString("id-ID")}
          subtitle="Nasional"
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Aset"
          value={formatRupiah(dashboardData.totalAset)}
          subtitle="Akumulasi nasional"
          icon={Wallet}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sebaran Koperasi per Provinsi</CardTitle>
          <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <TrendingUp className="h-4 w-4" />
            {dashboardData.totalKoperasi} total
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.sebaran} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="provinsi"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <RechartsTooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="jumlahKoperasi" name="Jumlah Koperasi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
