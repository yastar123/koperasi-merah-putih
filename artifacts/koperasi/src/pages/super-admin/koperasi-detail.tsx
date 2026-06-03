import { useGetKoperasi, useVerifikasiKoperasi, useListAnggota, useListUnitUsaha } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusBadgeVariant, formatDate, formatRupiah } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, ArrowLeft, Building, MapPin, Users, Store } from "lucide-react";

export default function SuperAdminKoperasiDetail() {
  const { id } = useParams();
  const koperasiId = Number(id);
  const { toast } = useToast();

  const { data: koperasi, isLoading, refetch } = useGetKoperasi(
    koperasiId,
    { query: { enabled: !!koperasiId } }
  );

  const { data: anggotaList } = useListAnggota(
    { koperasiId },
    { query: { enabled: !!koperasiId } }
  );

  const { data: unitList } = useListUnitUsaha(
    { koperasiId },
    { query: { enabled: !!koperasiId } }
  );

  const verifikasiMutation = useVerifikasiKoperasi({
    mutation: {
      onSuccess: () => {
        toast({ title: "Status koperasi berhasil diperbarui" });
        refetch();
      }
    }
  });

  const handleVerifikasi = (status: "aktif" | "ditolak") => {
    verifikasiMutation.mutate({
      id: koperasiId,
      data: { status, catatan: status === "aktif" ? "Verifikasi disetujui" : "Verifikasi ditolak" }
    });
  };

  if (isLoading) return <div className="p-8">Memuat detail koperasi...</div>;
  if (!koperasi) return <div className="p-8">Koperasi tidak ditemukan.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/koperasi" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{koperasi.nama}</h2>
          <p className="text-muted-foreground">Detail profil dan data operasi koperasi.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Profil Koperasi</CardTitle>
              <CardDescription>Informasi umum dan legalitas</CardDescription>
            </div>
            <Badge variant="outline" className={getStatusBadgeVariant(koperasi.status)}>
              {koperasi.status.toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Building className="h-4 w-4"/> No. Badan Hukum</span>
                <p className="font-medium">{koperasi.noBadanHukum || "Belum ada"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-4 w-4"/> Tanggal Berdiri</span>
                <p className="font-medium">{formatDate(koperasi.tanggalBerdiri)}</p>
              </div>
              <div className="col-span-2 space-y-1 border-t pt-4">
                <span className="text-sm text-muted-foreground">Alamat Lengkap</span>
                <p className="font-medium">{koperasi.alamat || "-"}</p>
                <p className="text-sm">{koperasi.desa}, {koperasi.kecamatan}, {koperasi.kabupaten}, {koperasi.provinsi}</p>
              </div>
              <div className="space-y-1 border-t pt-4">
                <span className="text-sm text-muted-foreground">Telepon</span>
                <p className="font-medium">{koperasi.telepon || "-"}</p>
              </div>
              <div className="space-y-1 border-t pt-4">
                <span className="text-sm text-muted-foreground">Email</span>
                <p className="font-medium">{koperasi.email || "-"}</p>
              </div>
            </div>
            
            {koperasi.status === "pending" && (
              <div className="flex gap-2 pt-6 border-t mt-6">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleVerifikasi("aktif")} disabled={verifikasiMutation.isPending}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Setujui Verifikasi
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleVerifikasi("ditolak")} disabled={verifikasiMutation.isPending}>
                  <XCircle className="mr-2 h-4 w-4" /> Tolak Pendaftaran
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Statistik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Total Anggota</span>
                <span className="font-bold">{anggotaList?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Total Aset</span>
                <span className="font-bold text-primary">{formatRupiah(koperasi.totalAset || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" /> Unit Usaha
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unitList?.length ? (
                <ul className="space-y-2">
                  {unitList.map(unit => (
                    <li key={unit.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <span>{unit.nama}</span>
                      <Badge variant="secondary" className="capitalize text-xs">{unit.jenis}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Belum ada unit usaha terdaftar.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
