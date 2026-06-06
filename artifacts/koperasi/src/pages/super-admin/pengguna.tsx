import { useState } from "react";
import { useListUsers, useUpdateUser, useCreateUser, useListKoperasi, type UserInputRole } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, XCircle, Users, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  pengurus: "Pengurus",
  pengawas: "Pengawas",
  anggota: "Anggota",
  operator_unit: "Operator Unit",
};

const createUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  role: z.string().min(1, "Role wajib dipilih"),
  koperasiId: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  telepon: z.string().optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function SuperAdminPengguna() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const { toast } = useToast();

  const { data: users, isLoading, refetch } = useListUsers(
    roleFilter !== "all" ? { role: roleFilter } : {}
  );

  const { data: koperasiList } = useListKoperasi(
    {},
    { query: { queryKey: [] } }
  );

  const updateUserMutation = useUpdateUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "Status pengguna berhasil diperbarui" });
        refetch();
      },
    }
  });

  const createUserMutation = useCreateUser({
    mutation: {
      onSuccess: () => {
        toast({ title: "Pengguna berhasil dibuat" });
        setOpenCreate(false);
        createForm.reset();
        refetch();
      },
      onError: (err: any) => {
        const msg = err?.message || "Gagal membuat pengguna";
        toast({ title: msg.includes("sudah") ? "Username sudah digunakan" : "Gagal membuat pengguna", variant: "destructive" });
      }
    }
  });

  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { username: "", password: "", nama: "", role: "", koperasiId: "", email: "", telepon: "" },
  });

  const watchRole = createForm.watch("role");
  const roleNeedsKoperasi = ["pengurus", "pengawas", "anggota", "operator_unit"].includes(watchRole);

  const handleToggleAktif = (id: number, currentStatus: boolean) => {
    updateUserMutation.mutate({ id, data: { aktif: !currentStatus } });
  };

  const onCreateUser = (data: CreateUserForm) => {
    createUserMutation.mutate({
      data: {
        username: data.username,
        password: data.password,
        nama: data.nama,
        role: data.role as UserInputRole,
        koperasiId: data.koperasiId ? Number(data.koperasiId) : undefined,
        email: data.email || undefined,
        telepon: data.telepon || undefined,
      }
    });
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
              className="w-full pl-8 sm:w-[220px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
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
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Pengguna
          </Button>
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

      {/* Dialog Buat Pengguna */}
      <Dialog open={openCreate} onOpenChange={(open) => { setOpenCreate(open); if (!open) createForm.reset(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Buat Pengguna Baru
            </DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={createForm.control} name="nama" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nama Lengkap <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Nama lengkap pengguna" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="username unik" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="password" placeholder="Min. 6 karakter" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="role" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role pengguna" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pengurus">Pengurus</SelectItem>
                        <SelectItem value="pengawas">Pengawas</SelectItem>
                        <SelectItem value="anggota">Anggota</SelectItem>
                        <SelectItem value="operator_unit">Operator Unit</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                {roleNeedsKoperasi && (
                  <FormField control={createForm.control} name="koperasiId" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Koperasi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih koperasi (opsional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {koperasiList?.map(k => (
                            <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <FormField control={createForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="email@contoh.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="telepon" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon</FormLabel>
                    <FormControl><Input placeholder="08xxxxxxxxxx" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Batal</Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Membuat..." : "Buat Pengguna"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
