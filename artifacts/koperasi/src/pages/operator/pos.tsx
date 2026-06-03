import { useAuth } from "@/hooks/use-auth";
import { useListProduk, useCreateTransaksi } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/format";
import { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OperatorPOS() {
  const { user } = useAuth();
  const { toast } = useToast();
  const unitUsahaId = 1;

  const { data: produkList, isLoading } = useListProduk({ unitUsahaId });
  const [cart, setCart] = useState<{produk: any, qty: number}[]>([]);
  const [search, setSearch] = useState("");

  const filteredProduk = produkList?.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const addToCart = (produk: any) => {
    if (produk.stok <= 0) {
      toast({ title: "Stok habis", variant: "destructive" });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.produk.id === produk.id);
      if (existing) {
        if (existing.qty >= produk.stok) {
          toast({ title: "Maksimal stok tercapai", variant: "destructive" });
          return prev;
        }
        return prev.map(item =>
          item.produk.id === produk.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { produk, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.produk.id !== id) return item;
      const newQty = item.qty + delta;
      if (newQty > item.produk.stok || newQty <= 0) return item;
      return { ...item, qty: newQty };
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.produk.id !== id));
  };

  const totalBelanja = cart.reduce((total, item) => total + item.produk.hargaJual * item.qty, 0);

  const createTransaksi = useCreateTransaksi({
    mutation: {
      onSuccess: () => {
        toast({ title: "✓ Transaksi berhasil!", description: `Total: ${formatRupiah(totalBelanja)}` });
        setCart([]);
      },
      onError: () => {
        toast({ title: "Gagal menyimpan transaksi", variant: "destructive" });
      }
    }
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;
    createTransaksi.mutate({
      data: {
        unitUsahaId,
        tanggal: new Date().toISOString(),
        items: cart.map(item => ({ produkId: item.produk.id, qty: item.qty }))
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-2rem)] lg:flex-row gap-4 lg:gap-6">
      {/* ── Product Grid ── */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
        {/* Search */}
        <div className="relative shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-10 h-11 bg-background border-border/60 focus:border-primary/50 transition-colors"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Product cards */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-28 rounded-xl" />
              ))}
            </div>
          ) : filteredProduk.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground font-medium">
                {search ? "Produk tidak ditemukan" : "Tidak ada produk tersedia"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
              {filteredProduk.map(produk => (
                <Card
                  key={produk.id}
                  className={`cursor-pointer card-lift select-none border-border/60 ${
                    produk.stok <= 0
                      ? 'opacity-40 grayscale cursor-not-allowed'
                      : 'hover:border-primary/40 active:scale-[0.97]'
                  }`}
                  onClick={() => addToCart(produk)}
                >
                  <CardContent className="p-3.5 flex flex-col h-full justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm leading-snug line-clamp-2">{produk.nama}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">{produk.kategori}</div>
                    </div>
                    <div>
                      <div className="text-primary font-bold text-sm">{formatRupiah(produk.hargaJual)}</div>
                      <div className={`text-[11px] mt-0.5 font-medium ${produk.stok <= 5 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                        Stok: {produk.stok} {produk.satuan}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Cart Panel ── */}
      <Card className="w-full lg:w-[360px] xl:w-[400px] flex flex-col shrink-0 shadow-lg border-border/60 overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground py-4 px-5 shrink-0">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Keranjang
            </div>
            {cart.length > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, item) => sum + item.qty, 0)} item
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-center py-12">
              <ShoppingCart className="h-14 w-14 mb-4 opacity-[0.15]" />
              <p className="font-medium text-sm">Keranjang masih kosong</p>
              <p className="text-xs mt-1 opacity-70">Ketuk produk untuk menambahkan</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.produk.id} className="flex flex-col gap-2 p-3 bg-muted/40 rounded-xl border border-border/30">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-medium text-sm leading-snug line-clamp-2 flex-1">{item.produk.nama}</div>
                  <button
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-0.5 rounded"
                    onClick={() => removeFromCart(item.produk.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-primary font-bold text-sm">
                    {formatRupiah(item.produk.hargaJual * item.qty)}
                  </div>
                  <div className="flex items-center gap-1 bg-background border border-border/60 rounded-lg overflow-hidden">
                    <button
                      className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => updateQty(item.produk.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-semibold w-7 text-center select-none">{item.qty}</span>
                    <button
                      className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => updateQty(item.produk.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3 border-t bg-muted/20 p-4 shrink-0">
          {cart.length > 0 && (
            <div className="w-full space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{cart.reduce((s, i) => s + i.qty, 0)} item</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-1 border-t border-border/50">
                <span>Total</span>
                <span className="text-primary">{formatRupiah(totalBelanja)}</span>
              </div>
            </div>
          )}
          <Button
            className="w-full h-12 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200"
            disabled={cart.length === 0 || createTransaksi.isPending}
            onClick={handleCheckout}
          >
            {createTransaksi.isPending ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" /> Memproses...</>
            ) : (
              "Bayar Sekarang"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
