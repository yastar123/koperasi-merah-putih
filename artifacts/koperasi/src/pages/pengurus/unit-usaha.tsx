import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListUnitUsaha, useCreateUnitUsaha, useListProduk, useCreateProduk, useUpdateProduk } from "@workspace/api-client-react";
import type { UnitUsahaInputJenis } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Truck, Stethoscope, Snowflake, Plus, Package, BarChart2, AlertTriangle, Edit2 } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const unitSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  jenis: z.string().min(1, "Jenis wajib dipilih"),
  deskripsi: z.string().optional(),
  aktif: z.boolean(),
});

const produkSchema = z.object({
  nama: z.string().min(2, "Nama produk minimal 2 karakter"),
  kategori: z.string().min(1, "Kategori wajib diisi"),
  hargaBeli: z.coerce.number().min(0),
  hargaJual: z.coerce.number().min(1, "Harga jual wajib diisi"),
  stok: z.coerce.number().min(0),
  satuan: z.string().min(1, "Satuan wajib diisi"),
});

type UnitForm = z.infer<typeof unitSchema>;
type ProdukForm = z.infer<typeof produkSchema>;

const UNIT_ICONS: Record<string, React.ElementType> = {
  sembako: Store,
  logistik: Truck,
  klinik: Stethoscope,
  cold_storage: Snowflake,
};

const UNIT_COLORS: Record<string, string> = {
  sembako: "text-blue-500",
  logistik: "text-orange-500",
  klinik: "text-red-500",
  cold_storage: "text-cyan-500",
};

function ProdukSheet({ unit, onClose }: { unit: any; onClose: () => void }) {
  const { toast } = useToast();
  const [editProduk, setEditProduk] = useState<any | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const { data: produkList, isLoading, refetch } = useListProduk({ unitUsahaId: unit.id });

  const updateProduk = useUpdateProduk({
    mutation: {
      onSuccess: () => {
        toast({ title: "Produk berhasil diperbarui" });
        setEditProduk(null);
        refetch();
      },
      onError: () => toast({ title: "Gagal memperbarui produk", variant: "destructive" }),
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
      onError: () => toast({ title: "Gagal menambahkan produk", variant: "destructive" }),
    }
  });

  const editForm = useForm<ProdukForm>({ resolver: zodResolver(produkSchema) });
  const createForm = useForm<ProdukForm>({
    resolver: zodResolver(produkSchema),
    defaultValues: { nama: "", kategori: "", hargaBeli: 0, hargaJual: 0, stok: 0, satuan: "pcs" },
  });

  const openEditDialog = (produk: any) => {
    setEditProduk(produk);
    editForm.reset({
      nama: produk.nama, kategori: produk.kategori,
      hargaBeli: produk.hargaBeli, hargaJual: produk.hargaJual,
      stok: produk.stok, satuan: produk.satuan,
    });
  };

  const stokMinim = (produkList ?? []).filter(p => p.stok <= 5).length;

  return (
    <>
      <Sheet open onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Produk — {unit.nama}
            </SheetTitle>
            <SheetDescription>
              Kelola produk yang dijual di unit usaha ini.
            </SheetDescription>
          </SheetHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              {stokMinim > 0 && (
                <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {stokMinim} produk stok kritis
                </div>
              )}
              <Button size="sm" onClick={() => setOpenCreate(true)} className="ml-auto">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Tambah Produk
              </Button>
            </div>

            {isLoading ? (
              <div className="page-animate space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
              </div>
            ) : !produkList || produkList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground/20 mb-3 empty-state-icon" />
                <p className="text-sm text-muted-foreground font-medium">Belum ada produk</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Tambahkan produk pertama untuk unit ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="table-responsive"><Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead className="text-right">Harga Jual</TableHead>
                      <TableHead className="text-right">Stok</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produkList.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium text-sm">{p.nama}</div>
                          <div className="text-xs text-muted-foreground">{p.kategori}</div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatRupiah(p.hargaJual)}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold text-sm ${p.stok <= 5 ? 'text-red-600' : p.stok <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {p.stok}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">{p.satuan}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(p)} className="hover:text-primary h-7 px-2">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table></div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!editProduk} onOpenChange={(open) => !open && setEditProduk(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>Edit: {editProduk?.nama}</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => updateProduk.mutate({ id: editProduk.id, data }))} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={editForm.control} name="nama" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Nama Produk</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="kategori" render={({ field }) => (
                  <FormItem><FormLabel>Kategori</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="satuan" render={({ field }) => (
                  <FormItem><FormLabel>Satuan</FormLabel><FormControl><Input placeholder="pcs, kg..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="hargaBeli" render={({ field }) => (
                  <FormItem><FormLabel>Harga Beli (Rp)</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="hargaJual" render={({ field }) => (
                  <FormItem><FormLabel>Harga Jual (Rp)</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="stok" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Stok</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditProduk(null)}>Batal</Button>
                <Button type="submit" disabled={updateProduk.isPending}>{updateProduk.isPending ? "Menyimpan..." : "Simpan"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>Tambah Produk Baru</DialogTitle></DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((data) => createProduk.mutate({ data: { ...data, unitUsahaId: unit.id } }))} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={createForm.control} name="nama" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Nama Produk <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="Nama produk" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="kategori" render={({ field }) => (
                  <FormItem><FormLabel>Kategori <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="Makanan, Minuman..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="satuan" render={({ field }) => (
                  <FormItem><FormLabel>Satuan <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="pcs, kg..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="hargaBeli" render={({ field }) => (
                  <FormItem><FormLabel>Harga Beli (Rp)</FormLabel><FormControl><Input type="number" min={0} placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="hargaJual" render={({ field }) => (
                  <FormItem><FormLabel>Harga Jual (Rp) <span className="text-destructive">*</span></FormLabel><FormControl><Input type="number" min={0} placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="stok" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Stok Awal</FormLabel><FormControl><Input type="number" min={0} placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Batal</Button>
                <Button type="submit" disabled={createProduk.isPending}>{createProduk.isPending ? "Menyimpan..." : "Tambah Produk"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function PengurusUnitUsaha() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openCreate, setOpenCreate] = useState(false);
  const [kelolaUnit, setKelolaUnit] = useState<any | null>(null);

  const { data: units, isLoading, refetch } = useListUnitUsaha(
    { koperasiId: user?.koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!user?.koperasiId } }
  );

  const createUnit = useCreateUnitUsaha({
    mutation: {
      onSuccess: () => {
        toast({ title: "Unit usaha berhasil ditambahkan" });
        setOpenCreate(false);
        form.reset();
        refetch();
      },
      onError: () => toast({ title: "Gagal menambahkan unit usaha", variant: "destructive" }),
    }
  });

  const form = useForm<UnitForm>({
    resolver: zodResolver(unitSchema),
    defaultValues: { nama: "", jenis: "sembako", deskripsi: "", aktif: true },
  });

  const onSubmit = (data: UnitForm) => {
    if (!user?.koperasiId) return;
    createUnit.mutate({ data: { ...data, jenis: data.jenis as UnitUsahaInputJenis, koperasiId: user.koperasiId } });
  };

  return (
    <div className="page-animate space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unit Usaha Koperasi</h2>
          <p className="text-muted-foreground">Kelola berbagai unit bisnis milik koperasi.</p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
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
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
              <Store className="h-7 w-7 text-muted-foreground/40 empty-state-icon" />
            </div>
            <h3 className="font-bold text-base mb-1">Belum Ada Unit Usaha</h3>
            <p className="text-sm text-muted-foreground mb-4">Tambahkan unit usaha pertama untuk memulai operasional.</p>
            <Button onClick={() => setOpenCreate(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Unit Usaha
            </Button>
          </div>
        ) : (
          units.map((unit) => {
            const UnitIcon = UNIT_ICONS[unit.jenis] || Store;
            const iconColor = UNIT_COLORS[unit.jenis] || "text-gray-500";
            return (
              <Card key={unit.id} className="relative overflow-hidden card-lift group">
                {!unit.aktif && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Badge variant="secondary" className="text-lg">Nonaktif</Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="bg-muted p-2 rounded-lg">
                      <UnitIcon className={`h-8 w-8 ${iconColor}`} />
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
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => setKelolaUnit(unit)}
                    >
                      <Package className="h-3.5 w-3.5 mr-1.5" />
                      Kelola Produk
                    </Button>
                    <Button variant="default" className="w-full" size="sm" asChild>
                      <Link href="/pengurus/keuangan">
                        <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
                        Laporan
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {kelolaUnit && (
        <ProdukSheet unit={kelolaUnit} onClose={() => setKelolaUnit(null)} />
      )}

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Tambah Unit Usaha
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nama" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Unit Usaha <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Contoh: Kios Sembako Desa" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="jenis" render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Unit Usaha <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sembako">Sembako</SelectItem>
                      <SelectItem value="logistik">Logistik</SelectItem>
                      <SelectItem value="klinik">Klinik</SelectItem>
                      <SelectItem value="cold_storage">Cold Storage</SelectItem>
                      <SelectItem value="atk">ATK</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="deskripsi" render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi singkat tentang unit usaha ini..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="aktif" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">Status Aktif</FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">Unit usaha langsung aktif setelah dibuat</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => { setOpenCreate(false); form.reset(); }}>
                  Batal
                </Button>
                <Button type="submit" disabled={createUnit.isPending}>
                  {createUnit.isPending ? "Menyimpan..." : "Tambah Unit Usaha"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
