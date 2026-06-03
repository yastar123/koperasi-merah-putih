import { useState } from "react";
import { useListKoperasi } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant, formatDate } from "@/lib/format";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, Filter, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SuperAdminKoperasiList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: koperasiList, isLoading } = useListKoperasi(
    statusFilter !== "all" ? { status: statusFilter } : {}
  );

  const filtered = koperasiList?.filter(k =>
    k.nama.toLowerCase().includes(search.toLowerCase()) ||
    (k.desa?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
    (k.kabupaten?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
    (k.noBadanHukum?.toLowerCase() ?? "").includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Koperasi</h2>
          <p className="text-muted-foreground">Kelola dan verifikasi koperasi terdaftar.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari nama, lokasi..."
              className="w-full pl-8 sm:w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu Verifikasi</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
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
                  <TableHead>Nama Koperasi</TableHead>
                  <TableHead>No. Badan Hukum</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tanggal Berdiri</TableHead>
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
                        <Building2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-muted-foreground">
                          {search || statusFilter !== "all" ? "Tidak ada koperasi yang cocok" : "Tidak ada data koperasi"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((koperasi) => (
                    <TableRow key={koperasi.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{koperasi.nama}</TableCell>
                      <TableCell className="text-muted-foreground">{koperasi.noBadanHukum || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {koperasi.desa}, {koperasi.kabupaten}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(koperasi.tanggalBerdiri)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeVariant(koperasi.status)}>
                          {koperasi.status === "aktif" ? "Aktif"
                            : koperasi.status === "pending" ? "Menunggu"
                            : koperasi.status === "nonaktif" ? "Nonaktif"
                            : "Ditolak"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/super-admin/koperasi/${koperasi.id}`} className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                          Detail
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              Menampilkan {filtered.length} dari {koperasiList?.length ?? 0} koperasi
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
