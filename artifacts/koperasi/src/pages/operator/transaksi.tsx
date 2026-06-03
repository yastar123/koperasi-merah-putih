import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListTransaksi, useListUnitUsaha } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Search, ReceiptText, Store } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OperatorTransaksi() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

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
          <p className="text-muted-foreground">Daftar penjualan harian kasir unit usaha.</p>
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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="table-responsive"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>No. Ref</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-right">Total Transaksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j}><div className="skeleton h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ReceiptText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-muted-foreground">
                          {search ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi hari ini"}
                        </p>
                        {!search && <p className="text-sm text-muted-foreground mt-1">Proses transaksi melalui menu Kasir (POS).</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-sm text-muted-foreground">{formatDate(tx.tanggal)}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">TRX-{tx.id.toString().padStart(6, "0")}</TableCell>
                      <TableCell className="font-medium">{tx.namaAnggota || "Umum"}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{formatRupiah(tx.totalHarga)}</TableCell>
                    </TableRow>
                  ))
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
    </div>
  );
}
