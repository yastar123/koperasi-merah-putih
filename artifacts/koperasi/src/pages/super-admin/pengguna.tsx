import { useState } from "react";
import { useListUsers, useUpdateUser } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, XCircle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  pengurus: "Pengurus",
  pengawas: "Pengawas",
  anggota: "Anggota",
  operator_unit: "Operator Unit",
};

export default function SuperAdminPengguna() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: users, isLoading, refetch } = useListUsers(
    roleFilter !== "all" ? { role: roleFilter } : {}
  );

  const updateUserMutation = useUpdateUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "Status pengguna berhasil diperbarui" });
        refetch();
      },
    }
  });

  const handleToggleAktif = (id: number, currentStatus: boolean) => {
    updateUserMutation.mutate({ id, data: { aktif: !currentStatus } });
  };

  const filtered = users?.filter(u =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="page-animate space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground">Kelola akses dan role pengguna sistem.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari nama atau username..."
              className="w-full pl-8 sm:w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Semua Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="pengurus">Pengurus</SelectItem>
              <SelectItem value="pengawas">Pengawas</SelectItem>
              <SelectItem value="anggota">Anggota</SelectItem>
              <SelectItem value="operator_unit">Operator Unit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="table-responsive"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><div className="skeleton h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-muted-foreground">
                          {search || roleFilter !== "all" ? "Tidak ada pengguna yang cocok" : "Tidak ada data pengguna"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{u.nama}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{u.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {ROLE_LABELS[u.role] || u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.aktif ? "default" : "secondary"}
                          className={u.aktif ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" : ""}
                        >
                          {u.aktif ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {u.role !== "super_admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAktif(u.id, u.aktif)}
                            disabled={updateUserMutation.isPending}
                            className={u.aktif ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                          >
                            {u.aktif
                              ? <><XCircle className="h-4 w-4 mr-1" />Nonaktifkan</>
                              : <><CheckCircle className="h-4 w-4 mr-1" />Aktifkan</>
                            }
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table></div>
          </div>
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              Menampilkan {filtered.length} dari {users?.length ?? 0} pengguna
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
