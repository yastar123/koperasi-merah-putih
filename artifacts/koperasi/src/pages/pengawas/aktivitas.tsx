import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListAktivitas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { Activity, Shield, Clock, Database, User, Eye } from "lucide-react";

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

function tryParseJson(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}

export default function PengawasAktivitas() {
  const { user } = useAuth();
  const [detailLog, setDetailLog] = useState<any | null>(null);

  const { data: aktivitasList, isLoading } = useListAktivitas(
    { koperasiId: user?.koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!user?.koperasiId } }
  );

  const parsedDetail = detailLog ? tryParseJson(detailLog.detail ?? "") : null;

  return (
    <div className="page-animate space-y-6">
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
              <CardDescription className="text-xs mt-0.5">Klik baris untuk melihat detail perubahan data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="table-responsive"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Waktu</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Tabel</TableHead>
                  <TableHead className="pr-4">Detail</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><div className="skeleton h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !aktivitasList || aktivitasList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
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
                      <TableRow
                        key={log.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setDetailLog(log)}
                      >
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
                        <TableCell className="pr-2 text-sm text-muted-foreground max-w-[200px]">
                          <span className="truncate block">{log.detail || "—"}</span>
                        </TableCell>
                        <TableCell className="pr-4">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 btn-icon-sm text-muted-foreground hover:text-foreground">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table></div>
          </div>
          {!isLoading && aktivitasList && aktivitasList.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              {aktivitasList.length} entri aktivitas tercatat
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail log modal */}
      <Dialog open={!!detailLog} onOpenChange={(open) => !open && setDetailLog(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detail Aktivitas
            </DialogTitle>
          </DialogHeader>
          {detailLog && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 bg-muted/40 rounded-xl p-3.5">
                <div className="text-muted-foreground">Waktu</div>
                <div className="font-medium">{formatDate(detailLog.waktu)}</div>
                <div className="text-muted-foreground">Pengguna</div>
                <div className="font-medium">{detailLog.namaUser || "Sistem"}</div>
                <div className="text-muted-foreground">Aksi</div>
                <div>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${
                    AKSI_COLOR[detailLog.aksi?.toUpperCase()] || "bg-muted text-muted-foreground border-border"
                  }`}>
                    {detailLog.aksi?.toUpperCase()}
                  </span>
                </div>
                <div className="text-muted-foreground">Tabel</div>
                <div className="font-medium capitalize">{detailLog.tabel}</div>
                {detailLog.referensiId && (
                  <>
                    <div className="text-muted-foreground">ID Referensi</div>
                    <div className="font-mono font-medium">#{detailLog.referensiId}</div>
                  </>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Detail Perubahan</p>
                {parsedDetail ? (
                  <div className="divide-y border rounded-xl overflow-hidden bg-card">
                    {Object.entries(parsedDetail).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-3 px-3.5 py-2.5">
                        <span className="text-muted-foreground font-mono text-xs w-28 shrink-0 pt-0.5">{key}</span>
                        <span className="font-medium break-all">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border bg-muted/20 p-3.5 font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
                    {detailLog.detail || "Tidak ada detail"}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
