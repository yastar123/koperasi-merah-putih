import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats, useGetAktivitasTerbaru, useGetPinjamanJatuhTempo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, CreditCard, Activity, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  subtitleColor?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, accentColor, subtitleColor }: StatCardProps) {
  return (
    <Card className={`card-lift overflow-hidden border-l-4 ${accentColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} shrink-0`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-black tracking-tight stat-value">{value}</div>
        {subtitle && (
          <p className={`text-xs mt-1.5 flex items-center gap-1 ${subtitleColor || "text-muted-foreground"}`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-l-4 border-l-muted">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-9 w-9 rounded-xl" />
      </CardHeader>
      <CardContent>
        <div className="skeleton h-7 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </CardContent>
    </Card>
  );
}

export default function PengurusDashboard() {
  const { user } = useAuth();
  const koperasiId = user?.koperasiId;

  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats(
    { koperasiId: koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!koperasiId } }
  );
  const { data: aktivitas, isLoading: isLoadingAktivitas } = useGetAktivitasTerbaru(
    { koperasiId: koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!koperasiId } }
  );
  const { data: jatuhTempo, isLoading: isLoadingJatuhTempo } = useGetPinjamanJatuhTempo(
    { koperasiId: koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!koperasiId } }
  );

  const isLoading = isLoadingStats || isLoadingAktivitas || isLoadingJatuhTempo;

  return (
    <div className="page-animate space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight">
          Selamat datang, {user?.nama?.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground text-sm">
          Ringkasan kondisi koperasi hari ini
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-in">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Anggota Aktif"
              value={stats?.anggotaAktif ?? 0}
              subtitle={<>Dari {stats?.totalAnggota ?? 0} terdaftar</>}
              icon={Users}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              accentColor="border-l-blue-400"
            />
            <StatCard
              title="Total Simpanan"
              value={formatRupiah(stats?.totalSimpanan ?? 0)}
              subtitle={<><TrendingUp className="h-3 w-3" /> Semua jenis simpanan</>}
              subtitleColor="text-green-600"
              icon={Wallet}
              iconBg="bg-green-50"
              iconColor="text-green-600"
              accentColor="border-l-green-400"
            />
            <StatCard
              title="Pinjaman Aktif"
              value={formatRupiah(stats?.pinjamanAktif ?? 0)}
              subtitle={
                (stats?.tunggakan ?? 0) > 0 ? (
                  <><AlertTriangle className="h-3 w-3" /> {formatRupiah(stats?.tunggakan ?? 0)} tunggakan</>
                ) : (
                  <>Tidak ada tunggakan</>
                )
              }
              subtitleColor={(stats?.tunggakan ?? 0) > 0 ? "text-red-500" : "text-green-600"}
              icon={CreditCard}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
              accentColor="border-l-orange-400"
            />
            <StatCard
              title="Omzet Bulan Ini"
              value={formatRupiah(stats?.omzetBulanIni ?? 0)}
              subtitle={<><TrendingUp className="h-3 w-3" /> Semua unit usaha</>}
              subtitleColor="text-primary"
              icon={Activity}
              iconBg="bg-primary/10"
              iconColor="text-primary"
              accentColor="border-l-primary"
            />
          </>
        )}
      </div>

      {/* Detail cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pinjaman jatuh tempo */}
        <Card className="card-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Pinjaman Jatuh Tempo</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Perlu perhatian segera</p>
            </div>
            <Link href="/pengurus/pinjaman" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingJatuhTempo ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : jatuhTempo && jatuhTempo.length > 0 ? (
              <div className="table-responsive"><Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Anggota</TableHead>
                    <TableHead className="text-right text-xs">Sisa</TableHead>
                    <TableHead className="text-right text-xs">Jatuh Tempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jatuhTempo.slice(0, 5).map((pinjaman) => (
                    <TableRow key={pinjaman.id}>
                      <TableCell className="font-medium text-sm py-2">
                        <Link href={`/pengurus/pinjaman/${pinjaman.pinjamanId}`} className="hover:underline text-primary">
                          {pinjaman.namaAnggota}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-sm py-2 font-semibold">
                        {formatRupiah(pinjaman.jumlahAngsuran)}
                      </TableCell>
                      <TableCell className="text-right text-sm py-2 text-red-500 font-medium">
                        {formatDate(pinjaman.tanggalJatuhTempo)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-green-700">Semua angsuran lancar</p>
                <p className="text-xs text-muted-foreground mt-1">Tidak ada pinjaman jatuh tempo</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aktivitas terbaru */}
        <Card className="card-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Aktivitas Terbaru</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Log transaksi & perubahan</p>
          </CardHeader>
          <CardContent>
            {isLoadingAktivitas ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-3 w-28" />
                  </div>
                ))}
              </div>
            ) : aktivitas && aktivitas.length > 0 ? (
              <div className="space-y-2.5">
                {aktivitas.map((item, i) => (
                  <div key={item.id} className="flex gap-3 items-start pb-2.5 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full bg-primary/60 shrink-0 mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">{item.deskripsi}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <span className="font-medium">{item.namaUser || "Sistem"}</span>
                        <span>·</span>
                        <span>{formatDate(item.waktu)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Activity className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">Belum ada aktivitas tercatat.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
