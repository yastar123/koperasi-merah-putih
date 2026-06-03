---
name: ProdukUpdate type shape
description: ProdukUpdate only allows nama/hargaBeli/hargaJual/stok — no unitUsahaId, satuan, or kategori.
---

`ProdukUpdate` (from `lib/api-client-react/src/generated/api.schemas.ts`) only has optional fields:
- `nama?`, `hargaBeli?`, `hargaJual?`, `stok?`

Fields like `unitUsahaId`, `satuan`, `kategori` are NOT in `ProdukUpdate` (they live in `ProdukInput` for create only).

**Why:** The API update endpoint intentionally doesn't allow reassigning a product to a different unit or changing its unit-of-measure.

**How to apply:** When calling `updateProduk.mutate({ id, data: {...} })`, destructure only the allowed fields:
```ts
updateProduk.mutate({ id: editProduk.id, data: { nama: data.nama, hargaBeli: data.hargaBeli, hargaJual: data.hargaJual, stok: data.stok } });
```
