import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, LogIn } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

const DEMO_ACCOUNTS = [
  { value: "superadmin", label: "Super Admin — Dinas Koperasi", role: "Super Admin", color: "bg-red-100 text-red-700" },
  { value: "pengurus1", label: "Pengurus — Koperasi Sukamaju", role: "Pengurus", color: "bg-blue-100 text-blue-700" },
  { value: "pengawas1", label: "Pengawas — Koperasi Sukamaju", role: "Pengawas", color: "bg-purple-100 text-purple-700" },
  { value: "anggota1", label: "Anggota — Koperasi Sukamaju", role: "Anggota", color: "bg-green-100 text-green-700" },
  { value: "operator1", label: "Operator — Unit Usaha Sembako", role: "Operator", color: "bg-orange-100 text-orange-700" },
];

const STATS = [
  { value: "2.4K+", label: "Koperasi Aktif" },
  { value: "180K+", label: "Total Anggota" },
  { value: "Rp 2.1T", label: "Aset Nasional" },
  { value: "50K+", label: "Transaksi/Hari" },
];

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "password123" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => login(data);
  const setDemoAccount = (username: string) => form.setValue("username", username);

  return (
    <div className="min-h-screen flex">
      {/* ── Hero Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-primary to-red-950" />

        {/* Animated geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" style={{animation: "float1 8s ease-in-out infinite"}} />
          <div className="absolute bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" style={{animation: "float2 10s ease-in-out infinite"}} />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-red-300/10 blur-2xl" style={{animation: "float3 12s ease-in-out infinite"}} />

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Diagonal stripe accent */}
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>

        {/* Logo */}
        <div className="relative z-10 fade-in-up" style={{animationDelay: "0ms"}}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white font-black text-lg border border-white/25 shadow-lg backdrop-blur-sm">
              MP
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight tracking-tight">Koperasi</div>
              <div className="text-white/60 text-xs tracking-[0.2em] uppercase font-medium">Merah Putih</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div className="fade-in-up" style={{animationDelay: "100ms"}}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 mb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-dot" />
              <span className="text-white/80 text-xs font-medium">Sistem Aktif — v2.0</span>
            </div>
            <h1 className="text-[2.8rem] font-black text-white leading-[1.1] tracking-tight">
              Kelola Koperasi<br />
              <span className="text-white/70">Lebih Cerdas</span>
            </h1>
            <p className="text-white/60 mt-4 text-base leading-relaxed max-w-sm">
              Platform terintegrasi untuk pengelolaan simpan pinjam, unit usaha, dan distribusi SHU koperasi Indonesia.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 fade-in-up" style={{animationDelay: "200ms"}}>
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white/8 rounded-2xl p-4 border border-white/10 hover:bg-white/12 transition-colors cursor-default"
                style={{animationDelay: `${i * 50}ms`}}
              >
                <div className="text-white font-bold text-2xl tracking-tight">{stat.value}</div>
                <div className="text-white/50 text-xs mt-0.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div className="fade-in-up flex items-center gap-3 py-4 border-t border-white/10" style={{animationDelay: "300ms"}}>
            <div className="flex -space-x-2">
              {["PU", "AG", "OP"].map((init, i) => (
                <div key={i} className="h-7 w-7 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-[10px] font-bold">
                  {init}
                </div>
              ))}
            </div>
            <p className="text-white/50 text-xs">5 peran pengguna · multi-koperasi</p>
          </div>
        </div>

        <div className="relative z-10 text-white/30 text-xs fade-in-up" style={{animationDelay: "400ms"}}>
          © 2026 Koperasi Merah Putih Indonesia
        </div>

        <style>{`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-20px, 30px) scale(1.05); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, -20px) scale(1.08); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(15px, 15px) rotate(180deg); }
          }
        `}</style>
      </div>

      {/* ── Login Form Panel ── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-[400px] space-y-6">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow">
              MP
            </div>
            <div>
              <div className="font-bold text-foreground text-sm leading-tight">Koperasi Merah Putih</div>
              <div className="text-muted-foreground text-xs">Sistem Manajemen Koperasi</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight">Selamat datang kembali</h2>
            <p className="text-muted-foreground text-sm">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {/* Demo accounts */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Akun Demo</label>
            <Select onValueChange={setDemoAccount}>
              <SelectTrigger className="h-11 bg-muted/40 hover:bg-muted/70 transition-colors border-border/50">
                <SelectValue placeholder="Pilih role untuk demo cepat..." />
              </SelectTrigger>
              <SelectContent>
                {DEMO_ACCOUNTS.map((acc) => (
                  <SelectItem key={acc.value} value={acc.value}>
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${acc.color}`}>
                        {acc.role}
                      </span>
                      <span className="text-sm">{acc.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Password semua akun: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">password123</code>
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-background px-3 text-muted-foreground/70 font-medium tracking-wider">atau masuk manual</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan username"
                        className="h-11 bg-muted/30 border-border/60 hover:border-border focus:border-ring transition-colors"
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
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password"
                          className="h-11 pr-11 bg-muted/30 border-border/60 hover:border-border focus:border-ring transition-colors"
                          autoComplete="current-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
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
                className="w-full h-11 font-semibold gap-2 text-sm shadow-sm hover:shadow-md transition-all duration-200 mt-2"
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
                    Masuk ke Sistem
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground/60">
            Sistem Koperasi Merah Putih · Kementerian Koperasi & UKM RI
          </p>
        </div>
      </div>
    </div>
  );
}
