import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListPinjaman, useListAngsuran, useBayarAngsuran } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard, Search, CheckCircle } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function OperatorAngsuran() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedPinjaman, setSelectedPinjaman] = useState<any | null>(null);
  const [selectedAngsuran, setSelectedAngsuran] = useState<any | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: pinjamanList } = useListPinjaman(
    { koperasiId: user?.koperasiId ?? undefined },
    { query: { queryKey: [], enabled: !!user?.koperasiId && search.length >= 2 } }
  );

  const { data: angsuranList } = useListAngsuran(
    { pinjamanId: selectedPinjaman?.id, status: "belum_lunas" },
    { query: { queryKey: [], enabled: !!selectedPinjaman?.id } }
  );

  const bayarAngsuran = useBayarAngsuran({
    mutation: {
      onSuccess: () => {
        toast({ title: "Angsuran berhasil dicatat!" });
        setSuccess(true);
        setSelectedPinjaman(null);
        setSelectedAngsuran(null);
        setSearch("");
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: () => {
        toast({ title: "Gagal mencatat angsuran", variant: "destructive" });
      }
    }
  });

  const filteredPinjaman = pinjamanList?.filter(p =>
    p.status === "disetujui" &&
    (p.namaAnggota?.toLowerCase().includes(search.toLowerCase()) ?? false)
  ) ?? [];

  const nextAngsuran = angsuranList?.find(a => a.status !== "lunas");

  const handleBayar = () => {
    const target = selectedAngsuran || nextAngsuran;
    if (!target) return;
    bayarAngsuran.mutate({
      data: {
        angsuranId: target.id,
        jumlahDibayar: target.jumlahAngsuran,
        tanggalBayar: new Date().toISOString().split("T")[0],
      }
    });
  };

  return (
    <div className="page-animate space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Terima Angsuran</h2>
        <p className="text-muted-foreground">Catat pembayaran angsuran pinjaman anggota.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
              onChange={(e) => { setSearch(e.target.value); setSelectedPinjaman(null); setSelectedAngsuran(null); }}
            />
            {search.length >= 2 && filteredPinjaman.length > 0 && !selectedPinjaman && (
              <div className="border rounded-lg overflow-hidden divide-y max-h-48 overflow-y-auto">
                {filteredPinjaman.map(p => (
                  <button
                    key={p.id}
                    className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors text-sm"
                    onClick={() => { setSelectedPinjaman(p); setSearch(p.namaAnggota || ""); }}
                  >
                    <div className="font-medium">{p.namaAnggota}</div>
                    <div className="text-muted-foreground text-xs">
                      Pinjaman: {formatRupiah(p.jumlahPinjaman)} · {p.tenorBulan} bln
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
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
                <div className="font-semibold text-sm">{selectedPinjaman.namaAnggota}</div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Total pinjaman</span>
                  <span className="font-medium">{formatRupiah(selectedPinjaman.jumlahPinjaman)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tenor</span>
                  <span className="font-medium">{selectedPinjaman.tenorBulan} bulan</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
            ) : nextAngsuran ? (
              <>
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Periode ke-{nextAngsuran.periodeKe}</span>
                    <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50">
                      Jatuh Tempo
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Jumlah Angsuran</span>
                    <span className="text-2xl font-bold text-primary">{formatRupiah(nextAngsuran.jumlahAngsuran)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Jatuh tempo</span>
                    <span>{formatDate(nextAngsuran.tanggalJatuhTempo)}</span>
                  </div>
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
                  {bayarAngsuran.isPending ? "Memproses..." : `Bayar ${formatRupiah(nextAngsuran.jumlahAngsuran)}`}
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground text-sm">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                Semua angsuran sudah lunas
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
