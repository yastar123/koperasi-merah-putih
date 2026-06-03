import { useState } from "react";
import { useListAnggota, useCreateSimpanan } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wallet, Search, CheckCircle } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function OperatorSimpanan() {
  const { toast } = useToast();
  const [searchAnggota, setSearchAnggota] = useState("");
  const [selectedAnggota, setSelectedAnggota] = useState<any | null>(null);
  const [jenis, setJenis] = useState("wajib");
  const [jumlah, setJumlah] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: anggotaList } = useListAnggota(
    { koperasiId: 1 },
    { query: { enabled: searchAnggota.length >= 2 } }
  );

  const createSimpanan = useCreateSimpanan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Simpanan berhasil dicatat!" });
        setSuccess(true);
        setSelectedAnggota(null);
        setJumlah("");
        setSearchAnggota("");
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: () => {
        toast({ title: "Gagal mencatat simpanan", variant: "destructive" });
      }
    }
  });

  const filteredAnggota = anggotaList?.filter(a =>
    a.nama.toLowerCase().includes(searchAnggota.toLowerCase()) ||
    a.nomorAnggota.includes(searchAnggota)
  ) ?? [];

  const handleSimpan = () => {
    if (!selectedAnggota || !jumlah) return;
    createSimpanan.mutate({
      data: {
        anggotaId: selectedAnggota.id,
        jenis: jenis as any,
        jumlah: Number(jumlah),
        tanggal: new Date().toISOString(),
        keterangan: `Setoran ${jenis} via operator`,
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Terima Simpanan</h2>
        <p className="text-muted-foreground">Catat setoran simpanan tunai dari anggota.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" /> Cari Anggota
            </CardTitle>
            <CardDescription>Masukkan nama atau nomor anggota.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Ketik nama atau nomor anggota..."
              value={searchAnggota}
              onChange={(e) => { setSearchAnggota(e.target.value); setSelectedAnggota(null); }}
            />
            {searchAnggota.length >= 2 && filteredAnggota.length > 0 && !selectedAnggota && (
              <div className="border rounded-lg overflow-hidden divide-y max-h-48 overflow-y-auto">
                {filteredAnggota.map(a => (
                  <button
                    key={a.id}
                    className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors text-sm"
                    onClick={() => { setSelectedAnggota(a); setSearchAnggota(a.nama); }}
                  >
                    <div className="font-medium">{a.nama}</div>
                    <div className="text-muted-foreground text-xs">{a.nomorAnggota}</div>
                  </button>
                ))}
              </div>
            )}
            {selectedAnggota && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <div className="font-semibold text-sm">{selectedAnggota.nama}</div>
                <div className="text-xs text-muted-foreground">No. {selectedAnggota.nomorAnggota}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" /> Detail Simpanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Jenis Simpanan</label>
              <Select value={jenis} onValueChange={setJenis}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pokok">Simpanan Pokok</SelectItem>
                  <SelectItem value="wajib">Simpanan Wajib</SelectItem>
                  <SelectItem value="sukarela">Simpanan Sukarela</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Jumlah (Rp)</label>
              <Input
                type="number"
                placeholder="0"
                min={1000}
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
              />
            </div>
            {jumlah && Number(jumlah) > 0 && (
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="text-2xl font-bold">{formatRupiah(Number(jumlah))}</div>
                <div className="text-xs text-muted-foreground mt-1">Jumlah yang akan diterima</div>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-green-800 text-sm">
                <CheckCircle className="h-4 w-4" />
                Simpanan berhasil dicatat!
              </div>
            )}
            <Button
              className="w-full"
              disabled={!selectedAnggota || !jumlah || Number(jumlah) < 1000 || createSimpanan.isPending}
              onClick={handleSimpan}
            >
              {createSimpanan.isPending ? "Menyimpan..." : "Catat Simpanan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
