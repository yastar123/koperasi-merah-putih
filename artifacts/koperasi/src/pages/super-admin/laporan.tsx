import { useRef } from "react";
import { useGetDashboardNasional } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Download, Building2, Users, Wallet, Clock, TrendingUp, Globe } from "lucide-react";

export default function SuperAdminLaporan() {
  const printRef = useRef<HTMLDivElement>(null);
  const { data: dashboardData, isLoading } = useGetDashboardNasional();

  const handleExportPDF = () => {
    const style = document.createElement("style");
    style.id = "print-style-temp";
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        #laporan-print-area, #laporan-print-area * { visibility: visible; }
        #laporan-print-area {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          padding: 24px !important;
        }
        .no-print { display: none !important; }
        .print-break { break-after: page; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  if (isLoading) return (
    <div className="page-animate space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="skeleton h-7 w-64" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="skeleton h-9 w-32 rounded-lg" />
      </div>
      <div className="skeleton h-56 rounded-xl" />
      <div className="skeleton h-64 rounded-xl" />
    </div>
  );

  if (!dashboardData) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Globe className="h-12 w-12 text-muted-foreground/20 mb-3" />
      <p className="text-muted-foreground">Data laporan tidak tersedia.</p>
    </div>
  );

  const now = new Date();
  const tanggalCetak = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  const activeRate = dashboardData.totalKoperasi > 0
    ? Math.round((dashboardData.koperasiAktif / dashboardData.totalKoperasi) * 100)
    : 0;

  const summaryCards = [
    {
      label: "Total Koperasi Terdaftar",
      value: dashboardData.totalKoperasi,
      sub: `${activeRate}% aktif`,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/5",
    },
    {
      label: "Koperasi Aktif",
      value: dashboardData.koperasiAktif,
      sub: "Beroperasi normal",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Menunggu Verifikasi",
      value: dashboardData.koperasiPending,
      sub: "Perlu tindak lanjut",
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Total Anggota Nasional",
      value: dashboardData.totalAnggota.toLocaleString("id-ID"),
      sub: "Anggota terdaftar",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Aset Nasional",
      value: formatRupiah(dashboardData.totalAset),
      sub: "Akumulasi aset koperasi",
      icon: Wallet,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Laporan Agregat Nasional</h2>
          <p className="text-muted-foreground">Ringkasan data seluruh koperasi di Indonesia.</p>
        </div>
        <Button onClick={handleExportPDF} className="self-start md:self-auto gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div id="laporan-print-area" ref={printRef} className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">
                MP
              </div>
              <span className="font-bold text-lg">Koperasi Merah Putih</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">Laporan Agregat Nasional</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Dicetak pada: {tanggalCetak}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-muted-foreground">Tahun {now.getFullYear()}</div>
            <div className="text-xs text-muted-foreground/60 mt-0.5">Sistem Informasi Koperasi</div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Ringkasan Eksekutif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="flex items-center gap-3 rounded-xl border border-border/60 p-3.5 card-lift">
                    <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground leading-tight">{card.label}</div>
                      <div className={`text-xl font-black stat-value ${card.color}`}>{card.value}</div>
                      <div className="text-[11px] text-muted-foreground/70 mt-0.5">{card.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-primary" />
              Rincian per Provinsi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provinsi</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jumlah Koperasi</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jumlah Anggota</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.sebaran.map((prov, i) => (
                    <tr key={prov.provinsi} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{prov.provinsi}</td>
                      <td className="px-4 py-3 text-right font-semibold">{prov.jumlahKoperasi}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{prov.jumlahAnggota.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-muted/30">
                    <td className="px-4 py-3 font-bold text-xs text-muted-foreground" colSpan={2}>Total</td>
                    <td className="px-4 py-3 text-right font-black text-primary">{dashboardData.totalKoperasi}</td>
                    <td className="px-4 py-3 text-right font-black text-primary">{dashboardData.totalAnggota.toLocaleString("id-ID")}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
          <span>Sistem Informasi Koperasi Merah Putih — Dinas Koperasi RI</span>
          <span>Halaman 1/1</span>
        </div>
      </div>
    </div>
  );
}
