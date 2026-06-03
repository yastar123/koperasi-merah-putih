import { useAuth } from "@/hooks/use-auth";
import { useListAktivitas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export default function PengawasAktivitas() {
  const { user } = useAuth();
  const { data: aktivitasList, isLoading } = useListAktivitas(
    { koperasiId: user?.koperasiId },
    { query: { enabled: !!user?.koperasiId } }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Log Aktivitas Sistem</h2>
          <p className="text-muted-foreground">Jejak rekam aktivitas seluruh pengguna di koperasi.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Aktivitas Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead>Aktivitas</TableHead>
                <TableHead>Referensi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Memuat log aktivitas...</TableCell>
                </TableRow>
              ) : !aktivitasList || aktivitasList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Tidak ada aktivitas.</TableCell>
                </TableRow>
              ) : (
                aktivitasList.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(log.waktu)}</TableCell>
                    <TableCell className="font-medium">{log.namaUser || "Sistem"}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">{log.aksi.toUpperCase()}</span> di tabel {log.tabel}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {log.detail || `ID Ref: ${log.referensiId}`}
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
