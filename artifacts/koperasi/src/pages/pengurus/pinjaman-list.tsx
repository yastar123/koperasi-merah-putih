import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListPinjaman, useSetujuiPinjaman } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate, getStatusBadgeVariant } from "@/lib/format";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Search, CreditCard } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  lunas: "Lunas",
  macet: "Macet",
};

export default function PengurusPinjamanList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: pinjamanList, isLoading, refetch } = useListPinjaman(
    { koperasiId: user?.koperasiId },
    { query: { enabled: !!user?.koperasiId } }
  );

  const setujuiPinjaman = useSetujuiPinjaman({
    mutation: {
      onSuccess: () => {
        toast({ title: "Status pinjaman diperbarui" });
        refetch();
      },
      onError: () => {
        toast({ title: "Gagal memperbarui status", variant: "destructive" });
      }
    }
  });

  const handleVerifikasi = (id: number, status: "disetujui" | "ditolak") => {
    setujuiPinjaman.mutate({
      id,
      data: { status, catatanPengurus: status === "disetujui" ? "Disetujui oleh pengurus" : "Ditolak oleh pengurus" }
    });
  };

  const filtered = pinjamanList?.filter(p => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesSearch = (p.namaAnggota?.toLowerCase() ?? "").includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }) ?? [];

  const pendingCount = pinjamanList?.filter(p => p.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Pinjaman</h2>
          <p className="text-muted-foreground">
            Kelola pengajuan pinjaman anggota.
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                {pendingCount} menunggu persetujuan
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari nama anggota..."
              className="w-full pl-8 sm:w-[220px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="disetujui">Disetujui</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
              <SelectItem value="lunas">Lunas</SelectItem>
              <SelectItem value="macet">Macet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Pengajuan</TableHead>
                  <TableHead>Anggota</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Tenor</TableHead>
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
                        <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-muted-foreground">
                          {search || statusFilter !== "all" ? "Tidak ada pinjaman yang cocok" : "Belum ada pengajuan pinjaman"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((pinjaman) => (
                    <TableRow key={pinjaman.id} className={`hover:bg-muted/30 transition-colors ${pinjaman.status === "pending" ? "bg-yellow-50/50" : ""}`}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(pinjaman.tanggalPengajuan)}</TableCell>
                      <TableCell className="font-medium">{pinjaman.namaAnggota}</TableCell>
                      <TableCell className="text-right font-semibold">{formatRupiah(pinjaman.jumlahPinjaman)}</TableCell>
                      <TableCell className="text-muted-foreground">{pinjaman.tenorBulan} bln</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeVariant(pinjaman.status)}>
                          {STATUS_LABELS[pinjaman.status] || pinjaman.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {pinjaman.status === "pending" ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-100 gap-1"
                              onClick={() => handleVerifikasi(pinjaman.id, "disetujui")}
                              disabled={setujuiPinjaman.isPending}
                            >
                              <CheckCircle className="h-4 w-4" /> Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-100 gap-1"
                              onClick={() => handleVerifikasi(pinjaman.id, "ditolak")}
                              disabled={setujuiPinjaman.isPending}
                            >
                              <XCircle className="h-4 w-4" /> Tolak
                            </Button>
                          </div>
                        ) : (
                          <Link href={`/pengurus/pinjaman/${pinjaman.id}`} className="text-primary hover:underline text-sm font-medium">
                            Detail →
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              {filtered.length} dari {pinjamanList?.length ?? 0} pinjaman
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
