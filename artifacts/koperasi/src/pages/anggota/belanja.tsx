import { useAuth } from "@/hooks/use-auth";
import { useListUnitUsaha, useListProduk } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, ShoppingBag, Package, ArrowRight, Tag, Info } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const UNIT_ICON_MAP: Record<string, React.ElementType> = {
  sembako: ShoppingBag,
  atk:     Package,
  default: Store,
};

const UNIT_COLOR_MAP: Record<string, string> = {
  sembako: "from-primary/10 to-primary/5",
  atk:     "from-blue-50 to-blue-50/30",
  default: "from-muted to-muted/30",
};

function ProdukKatalog({ unitUsahaId }: { unitUsahaId: number }) {
  const { data: produkList, isLoading } = useListProduk({ unitUsahaId });

  if (isLoading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-20 rounded-xl" />
      ))}
    </div>
  );

  if (!produkList || produkList.length === 0) return (
    <div className="page-animate flex flex-col items-center justify-center py-8 text-center">
      <Package className="h-8 w-8 text-muted-foreground/30 mb-2" />
      <p className="text-sm text-muted-foreground">Belum ada produk tersedia.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {produkList.map(produk => (
        <div key={produk.id} className={`rounded-xl border p-3 transition-all duration-200 ${
          produk.stok <= 0 ? "opacity-40 bg-muted/20" : "bg-muted/20 hover:bg-muted/40 hover:border-primary/20"
        }`}>
          <div className="font-medium text-sm leading-tight line-clamp-2">{produk.nama}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">{produk.kategori}</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-bold text-sm text-primary">{formatRupiah(produk.hargaJual)}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
              produk.stok <= 0 ? "border-red-200 text-red-600 bg-red-50" :
              produk.stok <= 5 ? "border-yellow-200 text-yellow-700 bg-yellow-50" :
              "border-green-200 text-green-700 bg-green-50"
            }`}>
              {produk.stok <= 0 ? "Habis" : `${produk.stok} ${produk.satuan}`}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnggotaBelanja() {
  const { user } = useAuth();
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);

  const { data: units, isLoading } = useListUnitUsaha(
    { koperasiId: user?.koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!user?.koperasiId } }
  );

  return (
    <div className="page-animate space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight">Katalog Unit Usaha</h2>
        <p className="text-muted-foreground text-sm">
          Lihat produk dari unit usaha koperasi. Transaksi belanja Anda dihitung sebagai kontribusi SHU.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          Belanja di unit usaha koperasi membantu meningkatkan porsi SHU Anda. Semakin aktif Anda berbelanja,
          semakin besar SHU yang akan Anda terima di akhir tahun.
        </p>
      </div>

      {/* Unit usaha cards */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-xl" />
          ))
        ) : !units || units.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed">
            <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-muted-foreground/40 empty-state-icon" />
            </div>
            <h3 className="text-base font-bold mb-1">Belum Ada Unit Usaha</h3>
            <p className="text-sm text-muted-foreground">Koperasi Anda belum mengaktifkan katalog produk online.</p>
          </Card>
        ) : (
          units.map(unit => {
            const UnitIcon = UNIT_ICON_MAP[unit.jenis] || UNIT_ICON_MAP.default;
            const gradientClass = UNIT_COLOR_MAP[unit.jenis] || UNIT_COLOR_MAP.default;
            const isExpanded = expandedUnit === unit.id;

            return (
              <Card key={unit.id} className={`card-lift overflow-hidden transition-all duration-200 ${
                isExpanded ? "ring-1 ring-primary/20" : ""
              }`}>
                {/* Unit header */}
                <div className={`bg-gradient-to-r ${gradientClass} p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-white/80 border border-white shadow-sm flex items-center justify-center shrink-0">
                        <UnitIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base leading-tight">{unit.nama}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                          {unit.deskripsi || "Unit usaha penyedia produk untuk anggota koperasi."}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="capitalize text-xs bg-white/60 border-white/80">
                            <Tag className="h-2.5 w-2.5 mr-1" />
                            {unit.jenis?.replace(/_/g, " ") || "Umum"}
                          </Badge>
                          {unit.aktif && (
                            <Badge variant="outline" className="text-xs bg-green-50/80 text-green-700 border-green-200">
                              Aktif
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={isExpanded ? "default" : "outline"}
                      size="sm"
                      className="shrink-0 gap-1.5"
                      onClick={() => setExpandedUnit(isExpanded ? null : unit.id)}
                    >
                      {isExpanded ? "Tutup" : (
                        <>Lihat Produk <ArrowRight className="h-3.5 w-3.5" /></>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Produk katalog (expandable) */}
                {isExpanded && (
                  <CardContent className="pt-4 pb-5 fade-in">
                    <ProdukKatalog unitUsahaId={unit.id} />
                    <p className="text-[11px] text-muted-foreground/60 text-center mt-4">
                      Untuk berbelanja, kunjungi unit usaha langsung atau hubungi operator koperasi.
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
