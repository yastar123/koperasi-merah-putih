import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListSimpanan, useCreateSimpanan, useListAnggota } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const simpananSchema = z.object({
  anggotaId: z.coerce.number().min(1, "Pilih anggota"),
  jenis: z.enum(["pokok", "wajib", "sukarela", "penarikan"]),
  jumlah: z.coerce.number().min(1000, "Jumlah minimal Rp 1.000"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  keterangan: z.string().optional(),
});

type SimpananForm = z.infer<typeof simpananSchema>;

export default function PengurusSimpanan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const { data: simpananList, isLoading, refetch } = useListSimpanan(
    { koperasiId: user?.koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!user?.koperasiId } }
  );

  const { data: anggotaList } = useListAnggota(
    { koperasiId: user?.koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!user?.koperasiId && openDialog } }
  );

  const createSimpanan = useCreateSimpanan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Simpanan berhasil dicatat" });
        setOpenDialog(false);
        form.reset();
        refetch();
      },
      onError: () => {
        toast({ title: "Gagal mencatat simpanan", variant: "destructive" });
      }
    }
  });

  const form = useForm<SimpananForm>({
    resolver: zodResolver(simpananSchema),
    defaultValues: {
      jenis: "wajib",
      tanggal: new Date().toISOString().split("T")[0],
      keterangan: "",
    },
  });

  const onSubmit = (data: SimpananForm) => {
    createSimpanan.mutate({
      data: {
        ...data,
        tanggal: new Date(data.tanggal).toISOString(),
      }
    });
  };

  const filtered = simpananList?.filter(s =>
    (s.namaAnggota?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
    (s.keterangan?.toLowerCase() ?? "").includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="page-animate space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Riwayat Simpanan</h2>
          <p className="text-muted-foreground">Catat dan pantau transaksi simpanan anggota.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari anggota, keterangan..."
              className="w-full pl-8 sm:w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Catat Simpanan
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="table-responsive"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Anggota</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
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
                        <Wallet className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-muted-foreground">
                          {search ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi simpanan"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((simpanan) => (
                    <TableRow key={simpanan.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground text-sm">{formatDate(simpanan.tanggal)}</TableCell>
                      <TableCell className="font-medium">{simpanan.namaAnggota}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          simpanan.jenis === "penarikan"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }>
                          {simpanan.jenis.charAt(0).toUpperCase() + simpanan.jenis.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{simpanan.keterangan || "-"}</TableCell>
                      <TableCell className={`text-right font-semibold ${simpanan.jenis === 'penarikan' ? 'text-red-600' : 'text-green-600'}`}>
                        {simpanan.jenis === 'penarikan' ? '−' : '+'}{formatRupiah(simpanan.jumlah)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table></div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Catat Transaksi Simpanan</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="anggotaId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Anggota <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih anggota..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {anggotaList?.map(a => (
                        <SelectItem key={a.id} value={String(a.id)}>{a.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="jenis" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pokok">Simpanan Pokok</SelectItem>
                        <SelectItem value="wajib">Simpanan Wajib</SelectItem>
                        <SelectItem value="sukarela">Simpanan Sukarela</SelectItem>
                        <SelectItem value="penarikan">Penarikan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tanggal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="jumlah" render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (Rp) <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="number" placeholder="0" min={1000} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="keterangan" render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl><Input placeholder="Opsional" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Batal</Button>
                <Button type="submit" disabled={createSimpanan.isPending}>
                  {createSimpanan.isPending ? "Menyimpan..." : "Catat Simpanan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
