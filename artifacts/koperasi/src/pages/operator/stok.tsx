import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListProduk, useUpdateProduk, useCreateProduk, useListUnitUsaha } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Package, AlertTriangle, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const produkSchema = z.object({
  nama: z.string().min(2, "Nama produk minimal 2 karakter"),
  kategori: z.string().min(1, "Kategori wajib diisi"),
  hargaBeli: z.coerce.number().min(0),
  hargaJual: z.coerce.number().min(1, "Harga jual wajib diisi"),
  stok: z.coerce.number().min(0),
  satuan: z.string().min(1, "Satuan wajib diisi"),
});

type ProdukForm = z.infer<typeof produkSchema>;

export default function OperatorStok() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editProduk, setEditProduk] = useState<any | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
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

  const { data: produkList, isLoading, refetch } = useListProduk(
    { unitUsahaId },
    { query: { queryKey: [], enabled: unitUsahaId > 0 } }
  );

  const updateProduk = useUpdateProduk({
    mutation: {
      onSuccess: () => {
        toast({ title: "Produk berhasil diperbarui" });
        setEditProduk(null);
        refetch();
      },
      onError: () => {
        toast({ title: "Gagal memperbarui produk", variant: "destructive" });
      }
    }
  });

  const createProduk = useCreateProduk({
    mutation: {
      onSuccess: () => {
        toast({ title: "Produk berhasil ditambahkan" });
        setOpenCreate(false);
        createForm.reset();
        refetch();
      },
      onError: () => {
        toast({ title: "Gagal menambahkan produk", variant: "destructive" });
      }
    }
  });

  const editForm = useForm<ProdukForm>({
    resolver: zodResolver(produkSchema),
  });

  const createForm = useForm<ProdukForm>({
    resolver: zodResolver(produkSchema),
    defaultValues: { nama: "", kategori: "", hargaBeli: 0, hargaJual: 0, stok: 0, satuan: "pcs" },
  });

  const openEditDialog = (produk: any) => {
    setEditProduk(produk);
    editForm.reset({
      nama: produk.nama,
      kategori: produk.kategori,
      hargaBeli: produk.hargaBeli,
      hargaJual: produk.hargaJual,
      stok: produk.stok,
      satuan: produk.satuan,
    });
  };

  const onEdit = (data: ProdukForm) => {
    updateProduk.mutate({ id: editProduk.id, data: { nama: data.nama, hargaBeli: data.hargaBeli, hargaJual: data.hargaJual, stok: data.stok } });
  };

  const onCreate = (data: ProdukForm) => {
    createProduk.mutate({ data: { ...data, unitUsahaId } });
  };

  const filtered = produkList?.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.kategori.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const stokMinim = filtered.filter(p => p.stok <= 5).length;

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
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Stok</h2>
          <p className="text-muted-foreground">Perbarui jumlah dan harga produk unit usaha.</p>
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
              placeholder="Cari produk..."
              className="w-full pl-8 sm:w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {stokMinim > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span><strong>{stokMinim} produk</strong> memiliki stok kritis (≤ 5 unit). Segera lakukan restok.</span>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="table-responsive"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
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
                        <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-muted-foreground">
                          {search ? "Tidak ada produk yang cocok" : "Belum ada data produk"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((produk) => (
                    <TableRow key={produk.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{produk.nama}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{produk.kategori}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatRupiah(produk.hargaJual)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${produk.stok <= 5 ? 'text-red-600' : produk.stok <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {produk.stok}
                        </span>
                        <span className="text-muted-foreground text-xs ml-1">{produk.satuan}</span>
                        {produk.stok <= 5 && <AlertTriangle className="inline h-3 w-3 text-red-500 ml-1" />}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(produk)} className="hover:text-primary">
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table></div>
          </div>
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              {filtered.length} produk ditemukan
              {unitList.length === 1 && <span className="ml-1 text-muted-foreground/60">· {unitList[0].nama}</span>}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editProduk} onOpenChange={(open) => !open && setEditProduk(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Edit Produk: {editProduk?.nama}</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="nama" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nama Produk</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="kategori" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="satuan" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <FormControl><Input placeholder="pcs, kg, liter..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="hargaBeli" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Beli (Rp)</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="hargaJual" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Jual (Rp)</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="stok" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Stok</FormLabel>
                    <FormControl><Input type="number" min={0} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditProduk(null)}>Batal</Button>
                <Button type="submit" disabled={updateProduk.isPending}>
                  {updateProduk.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Tambah Produk Baru</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={createForm.control} name="nama" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nama Produk <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Nama produk" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="kategori" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Makanan, Minuman..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="satuan" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="pcs, kg, liter..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="hargaBeli" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Beli (Rp)</FormLabel>
                    <FormControl><Input type="number" min={0} placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="hargaJual" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Jual (Rp) <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="number" min={0} placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="stok" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Stok Awal</FormLabel>
                    <FormControl><Input type="number" min={0} placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Batal</Button>
                <Button type="submit" disabled={createProduk.isPending}>
                  {createProduk.isPending ? "Menyimpan..." : "Tambah Produk"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
