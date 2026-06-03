import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats, useListProduk } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { ShoppingCart, PackageOpen, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function OperatorDashboard() {
  const { user } = useAuth();
  const koperasiId = user?.koperasiId;
  const unitUsahaId = 1;

  const { data: stats, isLoading } = useGetDashboardStats(
    { koperasiId: koperasiId! },
    { query: { enabled: !!koperasiId } }
  );

  const { data: produkList, isLoading: isLoadingProduk } = useListProduk({ unitUsahaId });

  const produkStokMinim = produkList?.filter(p => p.stok <= 5) ?? [];

  if (isLoading || isLoadingProduk) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-9 w-9 rounded-lg" />
              </CardHeader>
              <CardContent>
                <div className="skeleton h-7 w-32 mb-2" />
                <div className="skeleton h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Selamat datang, {user?.nama?.split(" ")[0]}</h2>
        <p className="text-muted-foreground">Ringkasan aktivitas unit usaha.</p>
      </div>

      {produkStokMinim.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-yellow-700 mt-0.5 shrink-0" />
          <div className="text-sm text-yellow-800">
            <strong>{produkStokMinim.length} produk</strong> memiliki stok kritis.{" "}
            <Link href="/operator/stok" className="underline font-medium">Cek stok →</Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Omzet Koperasi</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(stats?.omzetBulanIni ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total bulan ini</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Produk</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produkList?.length ?? 0} Produk</div>
            <p className="text-xs text-muted-foreground mt-1">Terdaftar di unit usaha</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Peringatan Stok</CardTitle>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${produkStokMinim.length > 0 ? "bg-yellow-50" : "bg-green-50"}`}>
              <PackageOpen className={`h-4 w-4 ${produkStokMinim.length > 0 ? "text-yellow-600" : "text-green-600"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${produkStokMinim.length > 0 ? "text-yellow-600" : "text-green-600"}`}>
              {produkStokMinim.length} Produk
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {produkStokMinim.length > 0 ? "Stok ≤ 5 unit, perlu restok" : "Semua stok aman"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 grid-cols-2">
            {[
              { href: "/operator/pos", icon: ShoppingCart, label: "Kasir (POS)", desc: "Proses transaksi" },
              { href: "/operator/stok", icon: PackageOpen, label: "Kelola Stok", desc: "Update inventori" },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent hover:border-primary/30 transition-all group"
              >
                <Icon className="h-8 w-8 mb-2 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">{label}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{desc}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {produkStokMinim.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Produk Stok Kritis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {produkStokMinim.slice(0, 5).map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{p.nama}</span>
                    <span className="text-red-600 font-bold">{p.stok} {p.satuan}</span>
                  </div>
                ))}
                {produkStokMinim.length > 5 && (
                  <Link href="/operator/stok" className="text-xs text-primary hover:underline mt-2 inline-block">
                    +{produkStokMinim.length - 5} produk lainnya →
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
