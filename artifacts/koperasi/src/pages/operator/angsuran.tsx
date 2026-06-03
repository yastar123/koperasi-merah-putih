import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OperatorAngsuran() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Terima Angsuran</h2>
          <p className="text-muted-foreground">Catat pembayaran angsuran pinjaman anggota.</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Form Pembayaran Angsuran
          </CardTitle>
          <CardDescription>Cari berdasarkan nomor anggota atau nama.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex h-32 items-center justify-center border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
             <Button variant="outline">Cari Tagihan Pinjaman</Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
