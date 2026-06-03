import { useAuth } from "@/hooks/use-auth";
import { useListAnggota } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant } from "@/lib/format";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PengurusAnggota() {
  const { user } = useAuth();
  const { data: anggotaList, isLoading } = useListAnggota(
    { koperasiId: user?.koperasiId },
    { query: { enabled: !!user?.koperasiId } }
  );

  return (
    <div className="space-y-6">
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
              placeholder="Cari anggota..."
              className="w-full pl-8 sm:w-[250px]"
            />
          </div>
          <Button>Tambah Anggota</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
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
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : !anggotaList || anggotaList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada data anggota.
                  </TableCell>
                </TableRow>
              ) : (
                anggotaList.map((anggota) => (
                  <TableRow key={anggota.id}>
                    <TableCell className="font-medium">{anggota.nomorAnggota}</TableCell>
                    <TableCell>{anggota.nama}</TableCell>
                    <TableCell>{anggota.nik}</TableCell>
                    <TableCell>{anggota.telepon || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeVariant(anggota.status)}>
                        {anggota.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/pengurus/anggota/${anggota.id}`} className="text-primary hover:underline text-sm font-medium">
                        Detail
                      </Link>
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
