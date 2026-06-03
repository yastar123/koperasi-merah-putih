import { useAuth } from "@/hooks/use-auth";
import { useListProduk, useUpdateProduk } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2 } from "lucide-react";

export default function OperatorStok() {
  const unitUsahaId = 1; // Example fallback
  const { data: produkList, isLoading } = useListProduk({ unitUsahaId });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Stok</h2>
          <p className="text-muted-foreground">Perbarui jumlah dan harga produk.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari produk..."
              className="w-full pl-8 sm:w-[250px]"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga Jual</TableHead>
                <TableHead className="text-right">Stok Tersedia</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Memuat produk...</TableCell>
                </TableRow>
              ) : !produkList || produkList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Belum ada data produk.</TableCell>
                </TableRow>
              ) : (
                produkList.map((produk) => (
                  <TableRow key={produk.id}>
                    <TableCell className="font-medium">{produk.nama}</TableCell>
                    <TableCell>{produk.kategori}</TableCell>
                    <TableCell className="text-right">{formatRupiah(produk.hargaJual)}</TableCell>
                    <TableCell className={`text-right font-medium ${produk.stok <= 5 ? 'text-red-600' : ''}`}>
                      {produk.stok} {produk.satuan}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
