import { useAuth } from "@/hooks/use-auth";
import { useListAktivitas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { Activity, Shield, Clock, Database, User } from "lucide-react";

const AKSI_COLOR: Record<string, string> = {
  CREATE: "bg-green-50 text-green-700 border-green-200",
  UPDATE: "bg-blue-50 text-blue-700 border-blue-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
  LOGIN:  "bg-purple-50 text-purple-700 border-purple-200",
};

const TABLE_ICONS: Record<string, React.ElementType> = {
  anggota:   User,
  simpanan:  Database,
  pinjaman:  Database,
  angsuran:  Clock,
  transaksi: Database,
  produk:    Database,
};

export default function PengawasAktivitas() {
  const { user } = useAuth();
  const { data: aktivitasList, isLoading } = useListAktivitas(
    { koperasiId: user?.koperasiId },
    { query: { enabled: !!user?.koperasiId } }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">Log Aktivitas Sistem</h2>
          <p className="text-muted-foreground text-sm">Jejak rekam seluruh aktivitas pengguna di koperasi.</p>
        </div>
        <div className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-blue-50 border border-blue-100 text-blue-700">
          <Shield className="h-4 w-4" />
          Audit Trail
        </div>
      </div>

      {/* Summary */}
      {!isLoading && aktivitasList && aktivitasList.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 stagger-in">
          {[
            {
              label: "Total Aktivitas",
              value: aktivitasList.length,
              icon: Activity,
              bgClass: "bg-primary/10",
              iconClass: "text-primary",
            },
            {
              label: "Entri Baru (CREATE)",
              value: aktivitasList.filter(a => a.aksi === "CREATE").length,
              icon: Database,
              bgClass: "bg-green-50",
              iconClass: "text-green-600",
            },
            {
              label: "Perubahan (UPDATE)",
              value: aktivitasList.filter(a => a.aksi === "UPDATE").length,
              icon: Clock,
              bgClass: "bg-blue-50",
              iconClass: "text-blue-600",
            },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 card-lift">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${item.bgClass}`}>
                <item.icon className={`h-4 w-4 ${item.iconClass}`} />
              </div>
              <div>
                <div className="text-xl font-black stat-value">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log table */}
      <Card className="card-lift">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Riwayat Aktivitas</CardTitle>
              <CardDescription className="text-xs mt-0.5">Log transaksi dan perubahan data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Waktu</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Tabel</TableHead>
                  <TableHead className="pr-4">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><div className="skeleton h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !aktivitasList || aktivitasList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Activity className="h-12 w-12 text-muted-foreground/20 mb-3 empty-state-icon" />
                        <p className="font-medium text-muted-foreground">Belum ada log aktivitas.</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Aktivitas sistem akan tercatat di sini.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  aktivitasList.map((log) => {
                    const TabelIcon = TABLE_ICONS[log.tabel] || Database;
                    return (
                      <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(log.waktu)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <User className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <span className="font-medium text-sm">{log.namaUser || "Sistem"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${
                            AKSI_COLOR[log.aksi.toUpperCase()] || "bg-muted text-muted-foreground border-border"
                          }`}>
                            {log.aksi.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <TabelIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="capitalize text-muted-foreground">{log.tabel}</span>
                            {log.referensiId && (
                              <span className="text-muted-foreground/60 text-xs">#{log.referensiId}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="pr-4 text-sm text-muted-foreground max-w-[280px]">
                          <span className="truncate block">{log.detail || "—"}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {!isLoading && aktivitasList && aktivitasList.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              {aktivitasList.length} entri aktivitas tercatat
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
