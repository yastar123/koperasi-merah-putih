import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedLayout } from "@/components/layouts/protected-layout";
import { SuperAdminLayout } from "@/components/layouts/super-admin-layout";
import { PengurusLayout } from "@/components/layouts/pengurus-layout";
import { PengawasLayout } from "@/components/layouts/pengawas-layout";
import { AnggotaLayout } from "@/components/layouts/anggota-layout";
import { OperatorLayout } from "@/components/layouts/operator-layout";

import Login from "@/pages/auth/login";

// Import pages
import SuperAdminDashboard from "@/pages/super-admin/dashboard";
import SuperAdminKoperasiList from "@/pages/super-admin/koperasi-list";
import SuperAdminKoperasiDetail from "@/pages/super-admin/koperasi-detail";
import SuperAdminPengguna from "@/pages/super-admin/pengguna";
import SuperAdminLaporan from "@/pages/super-admin/laporan";

import PengurusDashboard from "@/pages/pengurus/dashboard";
import PengurusAnggota from "@/pages/pengurus/anggota";
import PengurusAnggotaDetail from "@/pages/pengurus/anggota-detail";
import PengurusSimpanan from "@/pages/pengurus/simpanan";
import PengurusUnitUsaha from "@/pages/pengurus/unit-usaha";
import PengurusPinjamanList from "@/pages/pengurus/pinjaman-list";
import PengurusPinjamanDetail from "@/pages/pengurus/pinjaman-detail";
import PengurusKeuangan from "@/pages/pengurus/keuangan";
import PengurusSHU from "@/pages/pengurus/shu";

import PengawasDashboard from "@/pages/pengawas/dashboard";
import PengawasAktivitas from "@/pages/pengawas/aktivitas";
import PengawasLaporan from "@/pages/pengawas/laporan";
import PengawasAudit from "@/pages/pengawas/audit";

import AnggotaDashboard from "@/pages/anggota/dashboard";
import AnggotaKartu from "@/pages/anggota/kartu";
import AnggotaSimpanan from "@/pages/anggota/simpanan";
import AnggotaPinjaman from "@/pages/anggota/pinjaman";
import AnggotaBelanja from "@/pages/anggota/belanja";

import OperatorDashboard from "@/pages/operator/dashboard";
import OperatorPOS from "@/pages/operator/pos";
import OperatorStok from "@/pages/operator/stok";
import OperatorTransaksi from "@/pages/operator/transaksi";
import OperatorSimpanan from "@/pages/operator/simpanan";
import OperatorAngsuran from "@/pages/operator/angsuran";

const queryClient = new QueryClient();

function Placeholder() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Halaman Dalam Pembangunan</h2>
        <p className="text-muted-foreground mt-2">Tampilan sedang disusun</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/super-admin/:rest*">
        <ProtectedLayout allowedRoles={["super_admin"]}>
          <SuperAdminLayout>
            <Switch>
              <Route path="/super-admin/dashboard" component={SuperAdminDashboard} />
              <Route path="/super-admin/koperasi" component={SuperAdminKoperasiList} />
              <Route path="/super-admin/koperasi/:id" component={SuperAdminKoperasiDetail} />
              <Route path="/super-admin/pengguna" component={SuperAdminPengguna} />
              <Route path="/super-admin/laporan" component={SuperAdminLaporan} />
              <Route component={NotFound} />
            </Switch>
          </SuperAdminLayout>
        </ProtectedLayout>
      </Route>

      <Route path="/pengurus/:rest*">
        <ProtectedLayout allowedRoles={["pengurus"]}>
          <PengurusLayout>
            <Switch>
              <Route path="/pengurus/dashboard" component={PengurusDashboard} />
              <Route path="/pengurus/anggota" component={PengurusAnggota} />
              <Route path="/pengurus/anggota/:id" component={PengurusAnggotaDetail} />
              <Route path="/pengurus/simpanan" component={PengurusSimpanan} />
              <Route path="/pengurus/pinjaman" component={PengurusPinjamanList} />
              <Route path="/pengurus/pinjaman/:id" component={PengurusPinjamanDetail} />
              <Route path="/pengurus/unit-usaha" component={PengurusUnitUsaha} />
              <Route path="/pengurus/keuangan" component={PengurusKeuangan} />
              <Route path="/pengurus/shu" component={PengurusSHU} />
              <Route component={NotFound} />
            </Switch>
          </PengurusLayout>
        </ProtectedLayout>
      </Route>

      <Route path="/pengawas/:rest*">
        <ProtectedLayout allowedRoles={["pengawas"]}>
          <PengawasLayout>
            <Switch>
              <Route path="/pengawas/dashboard" component={PengawasDashboard} />
              <Route path="/pengawas/laporan" component={PengawasLaporan} />
              <Route path="/pengawas/audit" component={PengawasAudit} />
              <Route path="/pengawas/aktivitas" component={PengawasAktivitas} />
              <Route component={NotFound} />
            </Switch>
          </PengawasLayout>
        </ProtectedLayout>
      </Route>

      <Route path="/anggota/:rest*">
        <ProtectedLayout allowedRoles={["anggota"]}>
          <AnggotaLayout>
            <Switch>
              <Route path="/anggota/dashboard" component={AnggotaDashboard} />
              <Route path="/anggota/simpanan" component={AnggotaSimpanan} />
              <Route path="/anggota/pinjaman" component={AnggotaPinjaman} />
              <Route path="/anggota/belanja" component={AnggotaBelanja} />
              <Route path="/anggota/kartu" component={AnggotaKartu} />
              <Route component={NotFound} />
            </Switch>
          </AnggotaLayout>
        </ProtectedLayout>
      </Route>

      <Route path="/operator/:rest*">
        <ProtectedLayout allowedRoles={["operator_unit"]}>
          <OperatorLayout>
            <Switch>
              <Route path="/operator/dashboard" component={OperatorDashboard} />
              <Route path="/operator/pos" component={OperatorPOS} />
              <Route path="/operator/stok" component={OperatorStok} />
              <Route path="/operator/transaksi" component={OperatorTransaksi} />
              <Route path="/operator/simpanan" component={OperatorSimpanan} />
              <Route path="/operator/angsuran" component={OperatorAngsuran} />
              <Route component={NotFound} />
            </Switch>
          </OperatorLayout>
        </ProtectedLayout>
      </Route>

      <Route path="/">
        <ProtectedLayout>
          {() => <div className="p-8">Memuat...</div>}
        </ProtectedLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
