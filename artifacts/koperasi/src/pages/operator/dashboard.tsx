import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats, useListProduk, useListUnitUsaha } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { ShoppingCart, PackageOpen, TrendingUp, AlertTriangle, ArrowRight, Zap, Store } from "lucide-react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OperatorDashboard() {
  const { user } = useAuth();
  const koperasiId = user?.koperasiId;
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats(
    { koperasiId: koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!koperasiId } }
  );

  const { data: unitList, isLoading: isLoadingUnits } = useListUnitUsaha(
    { koperasiId: koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!koperasiId } }
  );

  useEffect(() => {
    if (unitList && unitList.length > 0 && selectedUnitId === null) {
      setSelectedUnitId(unitList[0].id);
    }
  }, [unitList, selectedUnitId]);

  const unitUsahaId = selectedUnitId ?? 0;

  const { data: produkList, isLoading: isLoadingProduk } = useListProduk(
    { unitUsahaId },
    { query: { queryKey: [], enabled: unitUsahaId > 0 } }
  );

  const produkStokMinim = produkList?.filter(p => p.stok <= 5) ?? [];
  const selectedUnit = unitList?.find(u => u.id === selectedUnitId);

  if (isLoadingStats || isLoadingUnits) {
    return (
      <div className="page-animate space-y-6">
        <div className="space-y-1">
          <div className="skeleton h-7 w-64" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 stagger-in">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!unitList || unitList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">
            Selamat datang, {user?.nama?.split(" ")[0]} 👋
          </h2>
          <p className="text-muted-foreground text-sm">Ringkasan aktivitas unit usaha hari ini</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20">
          <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
            <Store className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="font-semibold">Tidak ada unit usaha terdaftar</p>
          <p className="text-sm text-muted-foreground mt-1">Hubungi pengurus untuk menambahkan unit usaha terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">
            Selamat datang, {user?.nama?.split(" ")[0]} 👋
          </h2>
          <p className="text-muted-foreground text-sm">Ringkasan aktivitas unit usaha hari ini</p>
        </div>
        {unitList.length > 1 && (
          <Select
            value={String(selectedUnitId)}
            onValueChange={(v) => setSelectedUnitId(Number(v))}
          >
            <SelectTrigger className="w-full sm:w-[220px] shrink-0">
              <Store className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Pilih unit usaha" />
            </SelectTrigger>
            <SelectContent>
              {unitList.map(u => (
                <SelectItem key={u.id} value={String(u.id)}>{u.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedUnit && unitList.length === 1 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Store className="h-3.5 w-3.5" />
          <span className="font-medium">{selectedUnit.nama}</span>
          <span className="text-xs capitalize bg-muted px-2 py-0.5 rounded-full">{selectedUnit.jenis?.replace(/_/g, " ")}</span>
        </div>
      )}

      {produkStokMinim.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-yellow-700" />
          </div>
          <div className="text-sm text-yellow-800 flex-1">
            <strong>{produkStokMinim.length} produk</strong> memiliki stok kritis (≤ 5 unit).
            <Link href="/operator/stok" className="ml-1.5 underline font-semibold">Cek & restok →</Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3 stagger-in">
        <Card className="card-lift overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Omzet Bulan Ini</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-black stat-value">{formatRupiah(stats?.omzetBulanIni ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Total transaksi bulan ini</p>
          </CardContent>
        </Card>

        <Card className="card-lift overflow-hidden border-l-4 border-l-blue-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Produk</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 shrink-0">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-black stat-value">
              {isLoadingProduk ? <span className="skeleton h-7 w-12 inline-block" /> : (produkList?.length ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Produk terdaftar</p>
          </CardContent>
        </Card>

        <Card className={`card-lift overflow-hidden border-l-4 ${produkStokMinim.length > 0 ? "border-l-yellow-400" : "border-l-green-400"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stok Kritis</CardTitle>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
              produkStokMinim.length > 0 ? "bg-yellow-50" : "bg-green-50"
            }`}>
              <PackageOpen className={`h-4 w-4 ${produkStokMinim.length > 0 ? "text-yellow-600" : "text-green-600"}`} />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className={`text-2xl font-black stat-value ${produkStokMinim.length > 0 ? "text-yellow-600" : "text-green-700"}`}>
              {isLoadingProduk ? <span className="skeleton h-7 w-8 inline-block" /> : produkStokMinim.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {produkStokMinim.length > 0 ? "Produk perlu restok" : "Semua stok aman"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Akses Cepat
            </CardTitle>
            <p className="text-xs text-muted-foreground">Shortcut menu yang sering digunakan</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2">
              {[
                { href: "/operator/pos", icon: ShoppingCart, label: "Kasir (POS)", desc: "Proses transaksi baru", color: "bg-primary/5 hover:bg-primary/10 border-primary/10 hover:border-primary/20" },
                { href: "/operator/stok", icon: PackageOpen, label: "Kelola Stok", desc: "Update inventori produk", color: "bg-blue-50/50 hover:bg-blue-50 border-blue-100/50 hover:border-blue-200" },
              ].map(({ href, icon: Icon, label, desc, color }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center justify-center p-5 border rounded-xl transition-all duration-200 group ${color}`}
                >
                  <Icon className="h-7 w-7 mb-2.5 text-primary group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 text-center">{desc}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {!isLoadingProduk && produkStokMinim.length > 0 ? (
          <Card className="card-lift border-yellow-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Produk Stok Kritis
                </CardTitle>
                <Link href="/operator/stok" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                  Kelola <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {produkStokMinim.slice(0, 6).map(p => (
                  <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                    <span className="text-sm font-medium truncate pr-3">{p.nama}</span>
                    <span className="text-sm font-bold text-red-600 shrink-0 bg-red-50 px-2 py-0.5 rounded-md">
                      {p.stok} {p.satuan}
                    </span>
                  </div>
                ))}
                {produkStokMinim.length > 6 && (
                  <Link href="/operator/stok" className="text-xs text-primary hover:underline mt-1 inline-block font-medium">
                    +{produkStokMinim.length - 6} produk lainnya →
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-lift flex flex-col items-center justify-center text-center p-8 bg-green-50/40 border-green-100">
            <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
              <PackageOpen className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-800">
              {isLoadingProduk ? "Memuat data stok..." : "Stok Semua Produk Aman"}
            </h3>
            <p className="text-sm text-green-600/80 mt-1">
              {isLoadingProduk ? "Mohon tunggu sebentar" : "Semua produk memiliki stok yang cukup"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
