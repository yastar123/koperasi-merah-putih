import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListPinjaman, useListAngsuran, useBayarAngsuran } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard, Search, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function OperatorAngsuran() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedPinjaman, setSelectedPinjaman] = useState<any | null>(null);
  const [selectedAngsuranId, setSelectedAngsuranId] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: pinjamanList } = useListPinjaman(
    { koperasiId: user?.koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!user?.koperasiId && search.length >= 2 } }
  );

  const { data: angsuranList, refetch: refetchAngsuran } = useListAngsuran(
    { pinjamanId: selectedPinjaman?.id },
    { query: { queryKey: [], enabled: !!selectedPinjaman?.id } }
  );

  const bayarAngsuran = useBayarAngsuran({
    mutation: {
      onSuccess: () => {
        toast({ title: "Angsuran berhasil dicatat!" });
        setSuccess(true);
        setSelectedAngsuranId(null);
        refetchAngsuran();
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: () => {
        toast({ title: "Gagal mencatat angsuran", variant: "destructive" });
      }
    }
  });

  // Bug fix: was "disetujui" — active loans use status "aktif"
  const filteredPinjaman = pinjamanList?.filter(p =>
    (p.status === "aktif" || p.status === "macet") &&
    (p.namaAnggota?.toLowerCase().includes(search.toLowerCase()) ?? false)
  ) ?? [];

  const unpaidAngsuran = angsuranList?.filter(a => a.status !== "lunas") ?? [];
  const nextAngsuran = unpaidAngsuran[0];
  const selectedAngsuran = selectedAngsuranId
    ? unpaidAngsuran.find(a => a.id === selectedAngsuranId)
    : nextAngsuran;

  const handleBayar = () => {
    if (!selectedAngsuran) return;
    bayarAngsuran.mutate({
      data: {
        angsuranId: selectedAngsuran.id,
        jumlahDibayar: selectedAngsuran.jumlahAngsuran,
        tanggalBayar: new Date().toISOString().split("T")[0],
      }
    });
  };

  const totalLunas = angsuranList?.filter(a => a.status === "lunas").length ?? 0;
  const totalAngsuran = angsuranList?.length ?? 0;

  return (
    <div className="page-animate space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Terima Angsuran</h2>
        <p className="text-muted-foreground">Catat pembayaran angsuran pinjaman anggota.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cari pinjaman */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" /> Cari Pinjaman Aktif
            </CardTitle>
            <CardDescription>Masukkan nama anggota untuk mencari tagihan aktif.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Ketik nama anggota..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedPinjaman(null); setSelectedAngsuranId(null); }}
            />
            {search.length >= 2 && filteredPinjaman.length > 0 && !selectedPinjaman && (
              <div className="border rounded-lg overflow-hidden divide-y max-h-48 overflow-y-auto">
                {filteredPinjaman.map(p => (
                  <button
                    key={p.id}
                    className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors text-sm"
                    onClick={() => { setSelectedPinjaman(p); setSearch(p.namaAnggota || ""); setSelectedAngsuranId(null); }}
                  >
                    <div className="font-medium">{p.namaAnggota}</div>
                    <div className="text-muted-foreground text-xs">
                      Pinjaman: {formatRupiah(p.jumlahPinjaman)} · {p.tenorBulan} bln
                      {p.status === "macet" && <span className="ml-2 text-red-500 font-semibold">MACET</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {search.length >= 2 && filteredPinjaman.length === 0 && !selectedPinjaman && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tidak ada pinjaman aktif ditemukan.
              </p>
            )}
            {selectedPinjaman && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-2">
                <div className="font-semibold text-sm">{selectedPinjaman.namaAnggota}</div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Total pinjaman</span>
                  <span className="font-medium">{formatRupiah(selectedPinjaman.jumlahPinjaman)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tenor</span>
                  <span className="font-medium">{selectedPinjaman.tenorBulan} bulan</span>
                </div>
                {angsuranList && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-medium text-green-600">{totalLunas} / {totalAngsuran} lunas</span>
                  </div>
                )}
                <button
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 mt-1"
                  onClick={() => { setSelectedPinjaman(null); setSearch(""); setSelectedAngsuranId(null); }}
                >
                  Ganti anggota
                </button>
              </div>
            )}

            {/* Daftar angsuran belum bayar */}
            {selectedPinjaman && unpaidAngsuran.length > 1 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pilih angsuran yang akan dibayar:</p>
                <div className="border rounded-lg overflow-hidden divide-y max-h-48 overflow-y-auto">
                  {unpaidAngsuran.map(a => {
                    const isSelected = selectedAngsuranId === a.id || (!selectedAngsuranId && a.id === nextAngsuran?.id);
                    const isLate = new Date(a.tanggalJatuhTempo) < new Date();
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAngsuranId(a.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left gap-2 ${
                          isSelected ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar className={`h-3.5 w-3.5 shrink-0 ${isLate ? "text-red-500" : "text-muted-foreground"}`} />
                          <div>
                            <div className="font-medium">Periode ke-{a.periodeKe}</div>
                            <div className={`text-xs ${isLate ? "text-red-500" : "text-muted-foreground"}`}>
                              {isLate ? "⚠ Terlambat · " : ""}{formatDate(a.tanggalJatuhTempo)}
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold text-primary shrink-0">{formatRupiah(a.jumlahAngsuran)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail tagihan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" /> Detail Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedPinjaman ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground text-sm">
                Pilih pinjaman terlebih dahulu
              </div>
            ) : unpaidAngsuran.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground text-sm">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                Semua angsuran sudah lunas
              </div>
            ) : selectedAngsuran ? (
              <>
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Periode ke-{selectedAngsuran.periodeKe}</span>
                    {new Date(selectedAngsuran.tanggalJatuhTempo) < new Date() ? (
                      <Badge variant="outline" className="border-red-400 text-red-700 bg-red-50">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Terlambat
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50">
                        Jatuh Tempo
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Jumlah Angsuran</span>
                    <span className="text-2xl font-bold text-primary">{formatRupiah(selectedAngsuran.jumlahAngsuran)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Jatuh tempo</span>
                    <span>{formatDate(selectedAngsuran.tanggalJatuhTempo)}</span>
                  </div>
                  {totalAngsuran > 0 && (
                    <div className="pt-1">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progress angsuran</span>
                        <span>{totalLunas}/{totalAngsuran} lunas</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-700"
                          style={{ width: `${totalAngsuran > 0 ? (totalLunas / totalAngsuran) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {success && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-green-800 text-sm">
                    <CheckCircle className="h-4 w-4 success-pop" />
                    Angsuran berhasil dicatat!
                  </div>
                )}
                <Button
                  className="w-full"
                  disabled={bayarAngsuran.isPending}
                  onClick={handleBayar}
                >
                  {bayarAngsuran.isPending ? "Memproses..." : `Bayar ${formatRupiah(selectedAngsuran.jumlahAngsuran)}`}
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
