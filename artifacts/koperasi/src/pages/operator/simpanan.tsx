import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OperatorSimpanan() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Terima Simpanan</h2>
          <p className="text-muted-foreground">Catat setoran simpanan tunai dari anggota.</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" /> Form Setoran Simpanan
          </CardTitle>
          <CardDescription>Masukkan nomor anggota atau NIK untuk memulai.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {/* In a real app, this would be a full form with search for anggota, amount input, etc. */}
           <div className="flex h-32 items-center justify-center border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
             <Button variant="outline">Cari Anggota</Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
