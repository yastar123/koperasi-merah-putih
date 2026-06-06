import { useAuth } from "@/hooks/use-auth";
import { useGetLaporanShu } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, TrendingUp, Users, ShoppingBag, Award } from "lucide-react";

export default function PengurusSHU() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const { data: shu, isLoading } = useGetLaporanShu(
    { koperasiId: user?.koperasiId ?? undefined, tahun: currentYear },
    { query: { queryKey: [], enabled: !!user?.koperasiId } }
  );

  if (isLoading) return (
    <div className="page-animate space-y-6">
      <div className="space-y-1">
        <div className="skeleton h-7 w-64" />
        <div className="skeleton h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3 stagger-in">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
      <div className="skeleton h-64 rounded-xl" />
    </div>
  );

  return (
    <div className="page-animate space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight">Sisa Hasil Usaha (SHU)</h2>
        <p className="text-muted-foreground text-sm">Kalkulasi dan distribusi SHU tahun {currentYear}</p>
      </div>

      {!shu ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed">
          <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-5">
            <Calculator className="h-8 w-8 text-muted-foreground/40 empty-state-icon" />
          </div>
          <h3 className="text-lg font-bold mb-2">SHU Belum Dihitung</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Laporan keuangan tahun {currentYear} belum ditutup atau SHU belum didistribusikan oleh pengurus.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left w-full max-w-lg">
            {[
              { step: "1", title: "Tutup Buku", desc: "Selesaikan laporan keuangan tahun berjalan" },
              { step: "2", title: "Hitung SHU", desc: "Kalkulasi berdasarkan simpanan & partisipasi" },
              { step: "3", title: "Distribusi", desc: "Bagikan SHU kepada seluruh anggota aktif" },
            ].map(s => (
              <div key={s.step} className="bg-muted/40 rounded-xl p-4 border border-border/40">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mb-2">
                  {s.step}
                </div>
                <div className="font-semibold text-sm">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3 stagger-in">
            <Card className="card-lift overflow-hidden border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total SHU Dibagikan
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-black text-primary stat-value">{formatRupiah(shu.totalShu)}</div>
                <p className="text-xs text-muted-foreground mt-1.5">Tahun {currentYear}</p>
              </CardContent>
            </Card>

            <Card className="card-lift overflow-hidden border-l-4 border-l-blue-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Anggota Penerima
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-black stat-value">{shu.shuPerAnggota?.length ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1.5">Anggota aktif</p>
              </CardContent>
            </Card>

            <Card className="card-lift overflow-hidden border-l-4 border-l-green-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rata-rata SHU
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-black text-green-700 stat-value">
                  {shu.shuPerAnggota?.length
                    ? formatRupiah(Math.round(shu.totalShu / shu.shuPerAnggota.length))
                    : "—"}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Per anggota</p>
              </CardContent>
            </Card>
          </div>

          {/* Distribution formula info */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-blue-800 text-sm">Porsi Simpanan: 40%</div>
                <div className="text-xs text-blue-600/80 mt-0.5">
                  Berdasarkan total simpanan anggota dibanding total simpanan koperasi
                </div>
              </div>
            </div>
            <div className="bg-green-50/70 border border-green-100 rounded-xl p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <ShoppingBag className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-green-800 text-sm">Porsi Partisipasi: 60%</div>
                <div className="text-xs text-green-600/80 mt-0.5">
                  Berdasarkan total belanja anggota di unit usaha koperasi
                </div>
              </div>
            </div>
          </div>

          {/* Distribution table */}
          <Card className="card-lift">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Distribusi SHU per Anggota</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Berdasarkan porsi simpanan dan partisipasi belanja tahun {currentYear}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="table-responsive"><Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Anggota</TableHead>
                      <TableHead className="text-right">Total Simpanan</TableHead>
                      <TableHead className="text-right">Partisipasi Belanja</TableHead>
                      <TableHead className="text-right pr-4 font-semibold text-primary">SHU Diterima</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shu.shuPerAnggota.map((anggota: any, i: number) => (
                      <TableRow key={anggota.anggotaId} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium pl-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </div>
                            {anggota.namaAnggota}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatRupiah(anggota.totalSimpanan)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatRupiah(anggota.totalBelanja)}</TableCell>
                        <TableCell className="text-right font-bold text-primary tabular-nums pr-4">
                          {formatRupiah(anggota.bagianShu)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table></div>
              </div>
              <div className="px-4 py-3 border-t bg-primary/5 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Total SHU</span>
                <span className="text-sm font-black text-primary tabular-nums">{formatRupiah(shu.totalShu)}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
