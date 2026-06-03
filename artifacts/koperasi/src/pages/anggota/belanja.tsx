import { useAuth } from "@/hooks/use-auth";
import { useListUnitUsaha } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnggotaBelanja() {
  const { user } = useAuth();
  
  const { data: units, isLoading } = useListUnitUsaha(
    { koperasiId: user?.koperasiId, jenis: "sembako" },
    { query: { enabled: !!user?.koperasiId } }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Katalog Unit Usaha</h2>
          <p className="text-muted-foreground">Lihat produk dari unit usaha koperasi dan catat belanja untuk SHU.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">Memuat unit usaha...</div>
        ) : !units || units.length === 0 ? (
           <Card className="col-span-full flex flex-col items-center justify-center p-12 text-center border-dashed">
            <Store className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-1">Belum Ada Unit Usaha Sembako</h3>
            <p className="text-sm text-muted-foreground">Koperasi Anda belum mengaktifkan katalog online.</p>
          </Card>
        ) : (
          units.map(unit => (
            <Card key={unit.id} className="overflow-hidden border-primary/20">
              <div className="h-32 bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-primary/40" />
              </div>
              <CardHeader>
                <CardTitle>{unit.nama}</CardTitle>
                <CardDescription>{unit.deskripsi || "Unit usaha penyedia kebutuhan harian anggota."}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Lihat Katalog Produk</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
