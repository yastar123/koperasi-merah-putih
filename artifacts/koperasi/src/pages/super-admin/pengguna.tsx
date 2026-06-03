import { useListUsers, useUpdateUser } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminPengguna() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
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

  return (
    <div className="space-y-6">
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
              placeholder="Cari pengguna..."
              className="w-full pl-8 sm:w-[250px]"
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
          <Table>
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
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada data pengguna.
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nama}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {u.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.aktif ? "default" : "secondary"} className={u.aktif ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
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
                        >
                          {u.aktif ? <XCircle className="h-4 w-4 mr-1 text-red-500" /> : <CheckCircle className="h-4 w-4 mr-1 text-green-500" />}
                          {u.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      )}
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
