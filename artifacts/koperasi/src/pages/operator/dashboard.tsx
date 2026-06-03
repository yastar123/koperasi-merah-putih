import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { ShoppingCart, PackageOpen, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function OperatorDashboard() {
  const { user } = useAuth();
  const koperasiId = user?.koperasiId;

  // Assuming dashboard stats provides omzet for the whole koperasi
  // In a real scenario, this would be specific to the unit the operator handles
  const { data: stats, isLoading } = useGetDashboardStats(
    { koperasiId: koperasiId! },
    { query: { enabled: !!koperasiId } }
  );

  if (isLoading) {
    return <div className="flex h-full items-center justify-center p-8">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Operator</h2>
        <p className="text-muted-foreground">Ringkasan aktivitas unit usaha hari ini.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Transaksi</div>
            <p className="text-xs text-muted-foreground text-green-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 inline" />
              +2 dari kemarin
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Omzet Hari Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(850000)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peringatan Stok</CardTitle>
            <PackageOpen className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">5 Produk</div>
            <p className="text-xs text-muted-foreground mt-1">
              Stok menipis (&lt; 10 item)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-2">
            <Link href="/operator/pos" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors">
              <ShoppingCart className="h-8 w-8 mb-2 text-primary" />
              <span className="font-medium">Kasir (POS)</span>
            </Link>
            <Link href="/operator/stok" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent transition-colors">
              <PackageOpen className="h-8 w-8 mb-2 text-primary" />
              <span className="font-medium">Update Stok</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
