import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListTransaksi, useListUnitUsaha } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ReceiptText, Store, X, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function OperatorTransaksi() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [detailTx, setDetailTx] = useState<any | null>(null);

  const { data: unitList, isLoading: isLoadingUnits } = useListUnitUsaha(
    { koperasiId: user?.koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!user?.koperasiId } }
  );

  useEffect(() => {
    if (unitList && unitList.length > 0 && selectedUnitId === null) {
      setSelectedUnitId(unitList[0].id);
    }
  }, [unitList, selectedUnitId]);

  const unitUsahaId = selectedUnitId ?? 0;

  const { data: transaksiList, isLoading } = useListTransaksi(
    { unitUsahaId },
    { query: { queryKey: [], enabled: unitUsahaId > 0 } }
  );

  const filtered = transaksiList?.filter(tx =>
    (tx.namaAnggota?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
    `TRX-${tx.id.toString().padStart(6, "0")}`.includes(search.toUpperCase())
  ) ?? [];

  const totalOmzet = filtered.reduce((sum, tx) => sum + tx.totalHarga, 0);

  if (isLoadingUnits) {
    return (
      <div className="page-animate flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memuat data unit usaha...</p>
      </div>
    );
  }

  if (!unitList || unitList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
          <Store className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <div>
          <p className="font-semibold">Tidak ada unit usaha</p>
          <p className="text-sm text-muted-foreground mt-1">Hubungi pengurus untuk menambahkan unit usaha terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-animate space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h2>
          <p className="text-muted-foreground">Daftar penjualan harian kasir unit usaha. Klik baris untuk lihat detail.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {unitList.length > 1 && (
            <Select value={String(selectedUnitId)} onValueChange={(v) => setSelectedUnitId(Number(v))}>
              <SelectTrigger className="w-[200px]">
                <Store className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Pilih unit" />
              </SelectTrigger>
              <SelectContent>
                {unitList.map(u => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari transaksi, pelanggan..."
              className="w-full pl-8 sm:w-[260px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-3.5">
            <div className="text-xs text-muted-foreground mb-0.5">Total Transaksi</div>
            <div className="text-xl font-black stat-value">{filtered.length}</div>
          </div>
          <div className="rounded-xl border bg-card p-3.5">
            <div className="text-xs text-muted-foreground mb-0.5">Total Omzet</div>
            <div className="text-xl font-black stat-value text-primary">{formatRupiah(totalOmzet)}</div>
          </div>
          <div className="rounded-xl border bg-card p-3.5 hidden sm:block">
            <div className="text-xs text-muted-foreground mb-0.5">Rata-rata / Transaksi</div>
            <div className="text-xl font-black stat-value">{formatRupiah(filtered.length > 0 ? totalOmzet / filtered.length : 0)}</div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="table-responsive"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>No. Ref</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Total Transaksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><div className="skeleton h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ReceiptText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-muted-foreground">
                          {search ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi"}
                        </p>
                        {!search && <p className="text-sm text-muted-foreground mt-1">Proses transaksi melalui menu Kasir (POS).</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((tx) => {
                    const items = (tx.items as any[]) ?? [];
                    return (
                      <TableRow
                        key={tx.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setDetailTx(tx)}
                      >
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(tx.tanggal)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">TRX-{tx.id.toString().padStart(6, "0")}</TableCell>
                        <TableCell className="font-medium">{tx.namaAnggota || "Umum"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {items.length > 0 ? (
                            <span>{items.length} item</span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">{formatRupiah(tx.totalHarga)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table></div>
          </div>
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              {filtered.length} transaksi ditemukan
              {unitList.length === 1 && <span className="ml-1 text-muted-foreground/60">· {unitList[0].nama}</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail transaksi modal */}
      <Dialog open={!!detailTx} onOpenChange={(open) => !open && setDetailTx(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5" />
              Detail Transaksi
            </DialogTitle>
          </DialogHeader>
          {detailTx && (() => {
            const items = (detailTx.items as any[]) ?? [];
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-muted/40 rounded-xl p-3.5">
                  <div className="text-muted-foreground">No. Referensi</div>
                  <div className="font-mono font-semibold">TRX-{detailTx.id.toString().padStart(6, "0")}</div>
                  <div className="text-muted-foreground">Tanggal</div>
                  <div>{formatDate(detailTx.tanggal)}</div>
                  <div className="text-muted-foreground">Pelanggan</div>
                  <div className="font-medium">{detailTx.namaAnggota || "Umum"}</div>
                </div>

                {items.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Item Produk</p>
                    <div className="divide-y border rounded-xl overflow-hidden">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <Package className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{item.namaProduk}</div>
                              <div className="text-xs text-muted-foreground">{item.qty} × {formatRupiah(item.hargaSatuan)}</div>
                            </div>
                          </div>
                          <div className="font-semibold shrink-0 ml-3">{formatRupiah(item.subtotal)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Detail item tidak tersedia
                  </div>
                )}

                <div className="flex justify-between items-center pt-1 border-t font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatRupiah(detailTx.totalHarga)}</span>
                </div>

                <Button variant="outline" className="w-full" onClick={() => setDetailTx(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Tutup
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
