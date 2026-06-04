import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentAnggota } from "@/hooks/use-current-anggota";
import { useListPinjaman, useCreatePinjaman } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatDate, getStatusBadgeVariant } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const pinjamanSchema = z.object({
  jumlahPinjaman: z.coerce.number().min(100000, "Minimal pinjaman Rp 100.000"),
  tenorBulan: z.coerce.number().min(1).max(60),
  tujuan: z.string().min(5, "Jelaskan tujuan pinjaman"),
});

type PinjamanForm = z.infer<typeof pinjamanSchema>;

const TENOR_OPTIONS = [3, 6, 12, 18, 24, 36, 48, 60];

export default function AnggotaPinjaman() {
  const { user } = useAuth();
  const { anggotaId, isLoading: isLoadingAnggota } = useCurrentAnggota();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);

  const { data: pinjamanList, isLoading, refetch } = useListPinjaman(
    { anggotaId: anggotaId ?? undefined },
    { query: { queryKey: [], enabled: !!anggotaId } }
  );

  const createPinjaman = useCreatePinjaman({
    mutation: {
      onSuccess: () => {
        toast({ title: "Pengajuan pinjaman berhasil dikirim", description: "Menunggu persetujuan pengurus." });
        setOpenDialog(false);
        form.reset();
        refetch();
      },
      onError: () => {
        toast({ title: "Gagal mengajukan pinjaman", variant: "destructive" });
      }
    }
  });

  const form = useForm<PinjamanForm>({
    resolver: zodResolver(pinjamanSchema),
    defaultValues: { jumlahPinjaman: 0, tenorBulan: 12, tujuan: "" },
  });

  const onSubmit = (data: PinjamanForm) => {
    if (!anggotaId) {
      toast({ title: "Data anggota belum tersedia", variant: "destructive" });
      return;
    }
    createPinjaman.mutate({
      data: {
        ...data,
        anggotaId,
      }
    });
  };

  const watchJumlah = form.watch("jumlahPinjaman");
  const watchTenor = form.watch("tenorBulan");
  const estimasiAngsuran = watchJumlah && watchTenor
    ? Math.ceil((watchJumlah * 1.12) / watchTenor)
    : 0;

  return (
    <div className="page-animate space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pinjaman Saya</h2>
          <p className="text-muted-foreground">Lihat status pengajuan dan jadwal angsuran.</p>
        </div>
        <Button onClick={() => setOpenDialog(true)} disabled={!anggotaId}>
          <Plus className="mr-2 h-4 w-4" />
          Ajukan Pinjaman Baru
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="table-responsive"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Pengajuan</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tenor</TableHead>
                  <TableHead>Sisa Hutang</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingAnggota || isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><div className="skeleton h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !pinjamanList || pinjamanList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-muted-foreground">Anda belum memiliki riwayat pinjaman</p>
                        <p className="text-sm text-muted-foreground mt-1">Ajukan pinjaman pertama Anda sekarang.</p>
                        <Button className="mt-4" size="sm" onClick={() => setOpenDialog(true)} disabled={!anggotaId}>
                          Ajukan Pinjaman
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pinjamanList.map((pinjaman) => (
                    <TableRow key={pinjaman.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-sm text-muted-foreground">{formatDate(pinjaman.tanggalPengajuan)}</TableCell>
                      <TableCell className="font-semibold">{formatRupiah(pinjaman.jumlahPinjaman)}</TableCell>
                      <TableCell className="text-muted-foreground">{pinjaman.tenorBulan} bln</TableCell>
                      <TableCell className="font-medium text-red-600">{formatRupiah(pinjaman.sisaPinjaman || 0)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeVariant(pinjaman.status)}>
                          {pinjaman.status === "pending" ? "Menunggu"
                            : pinjaman.status === "disetujui" ? "Disetujui"
                            : pinjaman.status === "ditolak" ? "Ditolak"
                            : pinjaman.status === "lunas" ? "Lunas"
                            : pinjaman.status === "macet" ? "Macet"
                            : pinjaman.status}
                        </Badge>
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
            <DialogTitle>Ajukan Pinjaman Baru</DialogTitle>
            <DialogDescription>Pengajuan akan ditinjau oleh pengurus koperasi.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="jumlahPinjaman" render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Pinjaman (Rp) <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="number" placeholder="Minimal Rp 100.000" min={100000} step={50000} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tenorBulan" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenor <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TENOR_OPTIONS.map(t => (
                        <SelectItem key={t} value={String(t)}>{t} Bulan</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              {estimasiAngsuran > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <div className="text-xs text-muted-foreground mb-1">Estimasi angsuran per bulan (bunga 12%/tahun)</div>
                  <div className="text-lg font-bold text-primary">{formatRupiah(estimasiAngsuran)}</div>
                </div>
              )}
              <FormField control={form.control} name="tujuan" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tujuan Pinjaman <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Jelaskan tujuan penggunaan pinjaman" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Batal</Button>
                <Button type="submit" disabled={createPinjaman.isPending || !anggotaId}>
                  {createPinjaman.isPending ? "Mengirim..." : "Kirim Pengajuan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
