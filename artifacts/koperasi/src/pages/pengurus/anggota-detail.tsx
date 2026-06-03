import { useGetAnggota, useGetSaldoAnggota, useListPinjaman, useListSimpanan } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatusBadgeVariant, formatDate, formatRupiah } from "@/lib/format";
import { ArrowLeft, User, Wallet, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PengurusAnggotaDetail() {
  const { id } = useParams();
  const anggotaId = Number(id);

  const { data: anggota, isLoading } = useGetAnggota(
    anggotaId,
    { query: { queryKey: [], enabled: !!anggotaId } }
  );

  const { data: saldo } = useGetSaldoAnggota(
    anggotaId,
    { query: { queryKey: [], enabled: !!anggotaId } }
  );

  const { data: simpananList } = useListSimpanan(
    { anggotaId },
    { query: { queryKey: [], enabled: !!anggotaId } }
  );

  const { data: pinjamanList } = useListPinjaman(
    { anggotaId },
    { query: { queryKey: [], enabled: !!anggotaId } }
  );

  if (isLoading) return (
    <div className="page-animate space-y-6">
      <div className="flex items-center gap-4">
        <div className="skeleton h-9 w-9 rounded-md" />
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-56" />
          <div className="skeleton h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3 stagger-in">
        <div className="skeleton h-80 rounded-xl" />
        <div className="skeleton md:col-span-2 h-80 rounded-xl" />
      </div>
    </div>
  );
  if (!anggota) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-muted-foreground">Anggota tidak ditemukan.</p>
      <Link href="/pengurus/anggota" className="text-primary hover:underline mt-2 text-sm">← Kembali ke daftar</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pengurus/anggota" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{anggota.nama}</h2>
          <p className="text-muted-foreground">{anggota.nomorAnggota}</p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className={getStatusBadgeVariant(anggota.status)}>
            {anggota.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Profil Anggota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">NIK</span>
              <p className="font-medium">{anggota.nik}</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">Tempat, Tanggal Lahir</span>
              <p className="font-medium">{anggota.tempatLahir || "-"}, {formatDate(anggota.tanggalLahir)}</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">Alamat</span>
              <p className="font-medium">{anggota.alamat || "-"}</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">No. Telepon</span>
              <p className="font-medium">{anggota.telepon || "-"}</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">Pekerjaan</span>
              <p className="font-medium">{anggota.pekerjaan || "-"}</p>
            </div>
            <div className="space-y-1 border-t pt-3">
              <span className="text-muted-foreground">Terdaftar Pada</span>
              <p className="font-medium">{formatDate(anggota.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                  <Wallet className="h-4 w-4" /> Total Simpanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatRupiah(saldo?.totalSimpanan || 0)}</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                  <CreditCard className="h-4 w-4" /> Total Pinjaman Aktif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatRupiah(pinjamanList?.filter(p => p.status === 'disetujui' || p.status === 'macet').reduce((acc, p) => acc + (p.sisaPinjaman || 0), 0) || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <Tabs defaultValue="simpanan" className="w-full">
              <CardHeader className="pb-0 border-b">
                <TabsList className="bg-transparent h-auto p-0 border-b-0 space-x-6">
                  <TabsTrigger value="simpanan" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2 font-semibold">Riwayat Simpanan</TabsTrigger>
                  <TabsTrigger value="pinjaman" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-2 font-semibold">Riwayat Pinjaman</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6 p-0">
                <TabsContent value="simpanan" className="m-0">
                  <div className="table-responsive"><Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!simpananList || simpananList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Tidak ada riwayat simpanan.</TableCell>
                        </TableRow>
                      ) : (
                        simpananList.map(simpanan => (
                          <TableRow key={simpanan.id}>
                            <TableCell>{formatDate(simpanan.tanggal)}</TableCell>
                            <TableCell><Badge variant="outline" className="capitalize">{simpanan.jenis}</Badge></TableCell>
                            <TableCell>{simpanan.keterangan || "-"}</TableCell>
                            <TableCell className={`text-right font-medium ${simpanan.jenis === 'penarikan' ? 'text-red-600' : 'text-green-600'}`}>
                              {simpanan.jenis === 'penarikan' ? '-' : '+'}{formatRupiah(simpanan.jumlah)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table></div>
                </TabsContent>
                <TabsContent value="pinjaman" className="m-0">
                   <div className="table-responsive"><Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Sisa</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!pinjamanList || pinjamanList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Tidak ada riwayat pinjaman.</TableCell>
                        </TableRow>
                      ) : (
                        pinjamanList.map(pinjaman => (
                          <TableRow key={pinjaman.id}>
                            <TableCell>{formatDate(pinjaman.tanggalPengajuan)}</TableCell>
                            <TableCell>{formatRupiah(pinjaman.jumlahPinjaman)}</TableCell>
                            <TableCell>{formatRupiah(pinjaman.sisaPinjaman || 0)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusBadgeVariant(pinjaman.status)}>
                                {pinjaman.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table></div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
