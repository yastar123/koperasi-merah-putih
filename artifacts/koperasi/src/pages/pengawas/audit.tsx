import { useAuth } from "@/hooks/use-auth";
import { useGetLaporanAudit } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

export default function PengawasAudit() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const { data: audit, isLoading } = useGetLaporanAudit(
    { koperasiId: user?.koperasiId, tahun: currentYear },
    { query: { enabled: !!user?.koperasiId } }
  );

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton h-7 w-64" />
      <div className="skeleton h-28 rounded-xl" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  );
  
  if (!audit) {
    return (
       <Card className="flex flex-col items-center justify-center p-12 text-center m-8">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-1">Audit Belum Dilakukan</h3>
        <p className="text-sm text-muted-foreground">Belum ada catatan audit untuk tahun ini.</p>
      </Card>
    );
  }

  const skorWarna = audit.skorKesehatan >= 80 ? "text-green-600" : audit.skorKesehatan >= 60 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Laporan Audit & Kesehatan</h2>
          <p className="text-muted-foreground">Hasil pengawasan dan rekomendasi perbaikan.</p>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Skor Kesehatan Koperasi</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className={`text-4xl font-bold ${skorWarna}`}>{audit.skorKesehatan}/100</div>
          <Badge className={audit.statusKeuangan === 'sehat' ? 'bg-green-600' : 'bg-red-600'}>
            {audit.statusKeuangan?.toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-yellow-200 dark:border-yellow-900/50">
          <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-500">
              <AlertTriangle className="h-5 w-5" /> Temuan Audit
            </CardTitle>
            <CardDescription className="text-yellow-700/80 dark:text-yellow-400/80">Hal-hal yang perlu menjadi perhatian pengurus.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {audit.temuan.map((item, i) => (
                <li key={i} className="flex gap-2 items-start text-sm">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900/50">
          <CardHeader className="bg-green-50 dark:bg-green-900/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-500">
              <CheckCircle className="h-5 w-5" /> Rekomendasi
            </CardTitle>
            <CardDescription className="text-green-700/80 dark:text-green-400/80">Langkah perbaikan yang disarankan.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {audit.rekomendasi.map((item, i) => (
                <li key={i} className="flex gap-2 items-start text-sm">
                  <span className="text-green-600 mt-0.5">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
