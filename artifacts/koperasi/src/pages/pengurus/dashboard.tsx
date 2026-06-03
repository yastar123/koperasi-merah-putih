import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats, useGetAktivitasTerbaru, useGetPinjamanJatuhTempo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, CreditCard, Activity, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  subtitleColor,
}: {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  subtitleColor?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${subtitleColor || "text-muted-foreground"}`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-9 w-9 rounded-lg" />
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
    { koperasiId: koperasiId! },
    { query: { enabled: !!koperasiId } }
  );

  const { data: aktivitas, isLoading: isLoadingAktivitas } = useGetAktivitasTerbaru(
    { koperasiId: koperasiId! },
    { query: { enabled: !!koperasiId } }
  );

  const { data: jatuhTempo, isLoading: isLoadingJatuhTempo } = useGetPinjamanJatuhTempo(
    { koperasiId: koperasiId! },
    { query: { enabled: !!koperasiId } }
  );

  const isLoading = isLoadingStats || isLoadingAktivitas || isLoadingJatuhTempo;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Selamat datang, {user?.nama?.split(" ")[0]}</h2>
        <p className="text-muted-foreground text-sm">Ringkasan kondisi koperasi hari ini.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Anggota Aktif"
              value={stats?.anggotaAktif ?? 0}
              subtitle={<>Dari total {stats?.totalAnggota ?? 0} terdaftar</>}
              icon={Users}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Total Simpanan"
              value={formatRupiah(stats?.totalSimpanan ?? 0)}
              icon={Wallet}
              iconBg="bg-green-50"
              iconColor="text-green-600"
            />
            <StatCard
              title="Pinjaman Aktif"
              value={formatRupiah(stats?.pinjamanAktif ?? 0)}
              subtitle={
                (stats?.tunggakan ?? 0) > 0 ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    {formatRupiah(stats?.tunggakan ?? 0)} tunggakan
                  </>
                ) : (
                  <>Tidak ada tunggakan</>
                )
              }
              subtitleColor={(stats?.tunggakan ?? 0) > 0 ? "text-red-500" : "text-green-600"}
              icon={CreditCard}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
            />
            <StatCard
              title="Omzet Bulan Ini"
              value={formatRupiah(stats?.omzetBulanIni ?? 0)}
              subtitle={<><TrendingUp className="h-3 w-3" /> Semua unit usaha</>}
              subtitleColor="text-green-600"
              icon={Activity}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pinjaman Jatuh Tempo</CardTitle>
            <Link href="/pengurus/pinjaman" className="text-xs text-primary hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingJatuhTempo ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : jatuhTempo && jatuhTempo.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anggota</TableHead>
                    <TableHead className="text-right">Sisa</TableHead>
                    <TableHead className="text-right">Jatuh Tempo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jatuhTempo.slice(0, 5).map((pinjaman) => (
                    <TableRow key={pinjaman.id}>
                      <TableCell className="font-medium">
                        <Link href={`/pengurus/pinjaman/${pinjaman.id}`} className="hover:underline text-primary">
                          {pinjaman.namaAnggota}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatRupiah(pinjaman.sisaPinjaman || 0)}</TableCell>
                      <TableCell className="text-right text-red-500 font-medium">{formatDate(pinjaman.tanggalJatuhTempo)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-medium">Tidak ada pinjaman jatuh tempo</p>
                <p className="text-xs text-muted-foreground mt-1">Semua angsuran dalam kondisi baik.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAktivitas ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-3 w-28" />
                  </div>
                ))}
              </div>
            ) : aktivitas && aktivitas.length > 0 ? (
              <div className="space-y-3">
                {aktivitas.map((item) => (
                  <div key={item.id} className="flex flex-col gap-1 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                    <p className="text-sm leading-snug">{item.deskripsi}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="font-medium">{item.namaUser || "Sistem"}</span>
                      <span>·</span>
                      <span>{formatDate(item.waktu)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
