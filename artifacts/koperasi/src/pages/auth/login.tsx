import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  
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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground shadow-lg">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sistem Koperasi Merah Putih</h1>
          <p className="text-sm text-muted-foreground">Masuk ke akun Anda untuk melanjutkan</p>
        </div>
        
        <Card className="border-t-4 border-t-primary shadow-xl">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Pilih akun demo atau masukkan kredensial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-2">
              <label className="text-sm font-medium">Akun Demo Cepat</label>
              <Select onValueChange={setDemoAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role demo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="pengurus1">Pengurus Koperasi</SelectItem>
                  <SelectItem value="pengawas1">Pengawas Koperasi</SelectItem>
                  <SelectItem value="anggota1">Anggota Koperasi</SelectItem>
                  <SelectItem value="operator1">Operator Unit</SelectItem>
                </SelectContent>
              </Select>
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
                        <Input placeholder="Masukkan username" {...field} />
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
                        <Input type="password" placeholder="Masukkan password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
