import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, LogIn, ChevronDown } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

const DEMO_ACCOUNTS = [
  { value: "superadmin", label: "Super Admin (Dinas Koperasi)", role: "Super Admin" },
  { value: "pengurus1", label: "Pengurus Koperasi Sukamaju", role: "Pengurus" },
  { value: "pengawas1", label: "Pengawas Koperasi Sukamaju", role: "Pengawas" },
  { value: "anggota1", label: "Anggota Koperasi", role: "Anggota" },
  { value: "operator1", label: "Operator Unit Usaha", role: "Operator" },
];

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "password123",
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    login(data);
  };

  const setDemoAccount = (username: string) => {
    form.setValue("username", username);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-red-900 opacity-90" />
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white font-bold text-lg border border-white/30">
              MP
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">Koperasi</div>
              <div className="text-white/70 text-xs tracking-widest uppercase">Merah Putih</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Sistem Manajemen<br />Koperasi Digital
            </h1>
            <p className="text-white/70 mt-3 text-lg leading-relaxed">
              Platform terintegrasi untuk pengelolaan simpan pinjam, unit usaha, dan distribusi SHU koperasi Indonesia.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Koperasi Aktif", value: "2.4K+" },
              { label: "Total Anggota", value: "180K+" },
              { label: "Total Aset", value: "Rp 2.1T" },
              { label: "Transaksi/Hari", value: "50K+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="text-white font-bold text-xl">{stat.value}</div>
                <div className="text-white/60 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-white/40 text-xs">
          <span>© 2026 Koperasi Merah Putih Indonesia</span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                MP
              </div>
              <span className="font-bold text-primary">Koperasi Merah Putih</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Selamat datang kembali</h2>
            <p className="text-muted-foreground text-sm">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Akun Demo</label>
            <Select onValueChange={setDemoAccount}>
              <SelectTrigger className="h-10 bg-muted/50 border-border hover:bg-muted transition-colors">
                <SelectValue placeholder="Pilih role untuk demo cepat..." />
              </SelectTrigger>
              <SelectContent>
                {DEMO_ACCOUNTS.map((acc) => (
                  <SelectItem key={acc.value} value={acc.value}>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        {acc.role}
                      </span>
                      <span className="text-sm">{acc.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Password: <code className="bg-muted px-1 py-0.5 rounded text-xs">password123</code></p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">atau masuk dengan kredensial</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan username"
                        className="h-10"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password"
                          className="h-10 pr-10"
                          autoComplete="current-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-10 font-medium gap-2"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Masuk
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
