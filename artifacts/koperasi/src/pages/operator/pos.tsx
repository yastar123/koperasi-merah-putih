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
  // Assume operator manages the first unit they belong to or select one. Using 1 as fallback for demo.
  const unitUsahaId = 1; 

  const { data: produkList, isLoading } = useListProduk({ unitUsahaId });

  const [cart, setCart] = useState<{produk: any, qty: number}[]>([]);
  const [search, setSearch] = useState("");

  const filteredProduk = produkList?.filter(p => p.nama.toLowerCase().includes(search.toLowerCase())) || [];

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
        return prev.map(item => item.produk.id === produk.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { produk, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.produk.id === id) {
        const newQty = item.qty + delta;
        if (newQty > item.produk.stok) return item;
        if (newQty <= 0) return item;
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.produk.id !== id));
  };

  const totalBelanja = cart.reduce((total, item) => total + (item.produk.hargaJual * item.qty), 0);

  const createTransaksi = useCreateTransaksi({
    mutation: {
      onSuccess: () => {
        toast({ title: "Transaksi berhasil disimpan!" });
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
        items: cart.map(item => ({
          produkId: item.produk.id,
          qty: item.qty
        }))
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] lg:flex-row gap-6">
      {/* Product List */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 h-12 text-lg"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">Memuat produk...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
              {filteredProduk.map(produk => (
                <Card 
                  key={produk.id} 
                  className={`cursor-pointer transition-all hover:border-primary ${produk.stok <= 0 ? 'opacity-50 grayscale' : ''}`}
                  onClick={() => addToCart(produk)}
                >
                  <CardContent className="p-4 flex flex-col h-full justify-between gap-2">
                    <div>
                      <div className="font-semibold line-clamp-2">{produk.nama}</div>
                      <div className="text-xs text-muted-foreground">{produk.kategori}</div>
                    </div>
                    <div>
                      <div className="text-primary font-bold">{formatRupiah(produk.hargaJual)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Stok: {produk.stok} {produk.satuan}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <Card className="w-full lg:w-[400px] flex flex-col h-full shrink-0 shadow-lg border-primary/20">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg shrink-0">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Keranjang Belanja
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-center">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
              <p>Keranjang masih kosong</p>
              <p className="text-sm mt-1">Pilih produk untuk menambahkan ke keranjang</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.produk.id} className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="font-medium line-clamp-2 text-sm pr-2">{item.produk.nama}</div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-red-500 -mt-1 -mr-1 hover:bg-red-100 hover:text-red-700" onClick={() => removeFromCart(item.produk.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-primary font-semibold text-sm">
                    {formatRupiah(item.produk.hargaJual * item.qty)}
                  </div>
                  <div className="flex items-center gap-2 bg-background border rounded-md">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQty(item.produk.id, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQty(item.produk.id, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="flex-col gap-4 border-t bg-muted/20 p-4 shrink-0">
          <div className="flex justify-between w-full text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary text-xl">{formatRupiah(totalBelanja)}</span>
          </div>
          <Button 
            className="w-full h-12 text-lg" 
            disabled={cart.length === 0 || createTransaksi.isPending}
            onClick={handleCheckout}
          >
            {createTransaksi.isPending ? "Memproses..." : "Bayar Sekarang"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
