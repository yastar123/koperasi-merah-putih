import { useAuth } from "@/hooks/use-auth";
import { useListUnitUsaha } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Truck, Stethoscope, Snowflake, Plus } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";

export default function PengurusUnitUsaha() {
  const { user } = useAuth();
  const { data: units, isLoading } = useListUnitUsaha(
    { koperasiId: user?.koperasiId },
    { query: { enabled: !!user?.koperasiId } }
  );

  const getIcon = (jenis: string) => {
    switch(jenis) {
      case 'sembako': return <Store className="h-8 w-8 text-blue-500" />;
      case 'logistik': return <Truck className="h-8 w-8 text-orange-500" />;
      case 'klinik': return <Stethoscope className="h-8 w-8 text-red-500" />;
      case 'cold_storage': return <Snowflake className="h-8 w-8 text-cyan-500" />;
      default: return <Store className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unit Usaha Koperasi</h2>
          <p className="text-muted-foreground">Kelola berbagai unit bisnis milik koperasi.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Unit Usaha
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-xl" />
          ))
        ) : !units || units.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            Belum ada unit usaha. Klik "Tambah Unit Usaha" untuk memulai.
          </div>
        ) : (
          units.map((unit) => (
            <Card key={unit.id} className="relative overflow-hidden group">
              {!unit.aktif && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg">Nonaktif</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="bg-muted p-2 rounded-lg">
                    {getIcon(unit.jenis)}
                  </div>
                  <Badge variant="outline" className="capitalize">{unit.jenis.replace("_", " ")}</Badge>
                </div>
                <CardTitle className="mt-4">{unit.nama}</CardTitle>
                <CardDescription className="line-clamp-2">{unit.deskripsi || "Tidak ada deskripsi"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-2 pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Omzet Bulan Ini</p>
                  <p className="text-xl font-bold text-primary">{formatRupiah(unit.omzetBulanIni || 0)}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="w-full" size="sm">Kelola Produk</Button>
                  <Button variant="default" className="w-full" size="sm">Laporan</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
