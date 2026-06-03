import { useListKoperasi } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant, formatDate } from "@/lib/format";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function SuperAdminKoperasiList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: koperasiList, isLoading } = useListKoperasi(
    statusFilter !== "all" ? { status: statusFilter } : {}
  );

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
              placeholder="Cari koperasi..."
              className="w-full pl-8 sm:w-[250px]"
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
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : koperasiList?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Tidak ada data koperasi.
                  </TableCell>
                </TableRow>
              ) : (
                koperasiList?.map((koperasi) => (
                  <TableRow key={koperasi.id}>
                    <TableCell className="font-medium">{koperasi.nama}</TableCell>
                    <TableCell>{koperasi.noBadanHukum || "-"}</TableCell>
                    <TableCell>
                      {koperasi.desa}, {koperasi.kabupaten}
                    </TableCell>
                    <TableCell>{formatDate(koperasi.tanggalBerdiri)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeVariant(koperasi.status)}>
                        {koperasi.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/super-admin/koperasi/${koperasi.id}`} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
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
