import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListAnggota, useCreateAnggota } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant } from "@/lib/format";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const tambahAnggotaSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
  pekerjaan: z.string().optional(),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
});

type TambahAnggotaForm = z.infer<typeof tambahAnggotaSchema>;

export default function PengurusAnggota() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const { data: anggotaList, isLoading, refetch } = useListAnggota(
    { koperasiId: user?.koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!user?.koperasiId } }
  );

  const createAnggota = useCreateAnggota({
    mutation: {
      onSuccess: () => {
        toast({ title: "Anggota berhasil ditambahkan" });
        setOpenDialog(false);
        form.reset();
        refetch();
      },
      onError: () => {
        toast({ title: "Gagal menambahkan anggota", variant: "destructive" });
      }
    }
  });

  const form = useForm<TambahAnggotaForm>({
    resolver: zodResolver(tambahAnggotaSchema),
    defaultValues: { nama: "", nik: "", telepon: "", alamat: "", pekerjaan: "" },
  });

  const onSubmit = (data: TambahAnggotaForm) => {
    createAnggota.mutate({
      data: {
        ...data,
        koperasiId: user?.koperasiId!,
      }
    });
  };

  const filtered = anggotaList?.filter(a =>
    a.nama.toLowerCase().includes(search.toLowerCase()) ||
    a.nomorAnggota.toLowerCase().includes(search.toLowerCase()) ||
    (a.nik && a.nik.includes(search))
  ) ?? [];

  return (
    <div className="page-animate space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Anggota</h2>
          <p className="text-muted-foreground">Kelola data anggota koperasi Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari nama, NIK, nomor..."
              className="w-full pl-8 sm:w-[260px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anggota
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="table-responsive"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Anggota</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><div className="skeleton h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-muted-foreground">
                          {search ? "Tidak ada anggota yang cocok" : "Tidak ada data anggota"}
                        </p>
                        {!search && (
                          <p className="text-sm text-muted-foreground mt-1">Tambahkan anggota pertama koperasi Anda.</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((anggota) => (
                    <TableRow key={anggota.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm font-medium">{anggota.nomorAnggota}</TableCell>
                      <TableCell className="font-medium">{anggota.nama}</TableCell>
                      <TableCell className="text-muted-foreground">{anggota.nik}</TableCell>
                      <TableCell className="text-muted-foreground">{anggota.telepon || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeVariant(anggota.status)}>
                          {anggota.status === "aktif" ? "Aktif" : anggota.status === "nonaktif" ? "Nonaktif" : anggota.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/pengurus/anggota/${anggota.id}`} className="text-primary hover:underline text-sm font-medium">
                          Detail →
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table></div>
          </div>
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              Menampilkan {filtered.length} dari {anggotaList?.length ?? 0} anggota
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Anggota Baru</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="nama" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nama Lengkap <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Masukkan nama lengkap" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nik" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>NIK <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="16 digit NIK" maxLength={16} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="telepon" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon</FormLabel>
                    <FormControl><Input placeholder="08xx-xxxx-xxxx" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pekerjaan" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pekerjaan</FormLabel>
                    <FormControl><Input placeholder="Pekerjaan" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tempatLahir" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempat Lahir</FormLabel>
                    <FormControl><Input placeholder="Kota kelahiran" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tanggalLahir" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="alamat" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Alamat</FormLabel>
                    <FormControl><Input placeholder="Alamat lengkap" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Batal</Button>
                <Button type="submit" disabled={createAnggota.isPending}>
                  {createAnggota.isPending ? "Menyimpan..." : "Simpan Anggota"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
