import { useAuth } from "@/hooks/use-auth";
import { useListSimpanan } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PengurusSimpanan() {
  const { user } = useAuth();
  const { data: simpananList, isLoading } = useListSimpanan(
    { koperasiId: user?.koperasiId },
    { query: { enabled: !!user?.koperasiId } }
  );

  return (
    <div className="space-y-6">
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
              placeholder="Cari transaksi..."
              className="w-full pl-8 sm:w-[250px]"
            />
          </div>
          <Button>Catat Simpanan</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
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
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : !simpananList || simpananList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada transaksi simpanan.
                  </TableCell>
                </TableRow>
              ) : (
                simpananList.map((simpanan) => (
                  <TableRow key={simpanan.id}>
                    <TableCell>{formatDate(simpanan.tanggal)}</TableCell>
                    <TableCell className="font-medium">{simpanan.namaAnggota}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {simpanan.jenis}
                      </Badge>
                    </TableCell>
                    <TableCell>{simpanan.keterangan || "-"}</TableCell>
                    <TableCell className={`text-right font-medium ${simpanan.jenis === 'penarikan' ? 'text-red-600' : 'text-green-600'}`}>
                      {simpanan.jenis === 'penarikan' ? '-' : '+'}{formatRupiah(simpanan.jumlah)}
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
