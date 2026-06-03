import { useAuth } from "@/hooks/use-auth";
import { useGetAnggota, useGetSaldoAnggota } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, formatDate } from "@/lib/format";
import { QRCodeSVG } from "qrcode.react";

export default function AnggotaKartu() {
  const { user } = useAuth();
  
  const { data: anggota, isLoading } = useGetAnggota(
    user?.id || 0,
    { query: { enabled: !!user?.id } }
  );

  const { data: saldo } = useGetSaldoAnggota(
    user?.id || 0,
    { query: { enabled: !!user?.id } }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="skeleton h-7 w-56" />
        <div className="skeleton h-4 w-80" />
        <div className="skeleton w-full max-w-[400px] h-56 rounded-xl" />
        <div className="skeleton w-full max-w-[400px] h-16 rounded-xl" />
      </div>
    );
  }

  if (!anggota) return null;

  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Kartu Anggota Digital</h2>
        <p className="text-muted-foreground">Tunjukkan kartu ini saat bertransaksi di unit usaha koperasi.</p>
      </div>

      <Card className="w-full max-w-[400px] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-background text-primary">
                M
              </div>
              <div className="leading-tight">
                <div className="text-lg">KOPERASI</div>
                <div className="text-xs opacity-90">MERAH PUTIH</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-80 uppercase tracking-widest">KARTU ANGGOTA</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white p-2 rounded-lg shrink-0">
              <QRCodeSVG value={`ANGGOTA:${anggota.nomorAnggota}`} size={80} level="H" />
            </div>
            <div className="space-y-1">
              <div className="text-xs opacity-80 uppercase tracking-wider">Nama Anggota</div>
              <div className="font-bold text-lg leading-tight">{anggota.nama}</div>
              
              <div className="pt-2 text-xs opacity-80 uppercase tracking-wider">No. Anggota</div>
              <div className="font-mono font-medium">{anggota.nomorAnggota}</div>
              
              <div className="pt-2 text-xs opacity-80 uppercase tracking-wider">Bergabung Sejak</div>
              <div className="text-sm font-medium">{formatDate(anggota.createdAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {saldo && (
        <Card className="w-full max-w-[400px]">
          <CardContent className="p-4 flex justify-between items-center">
             <span className="text-muted-foreground text-sm font-medium">Saldo Simpanan:</span>
             <span className="font-bold text-lg text-primary">{formatRupiah(saldo.totalSimpanan)}</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
