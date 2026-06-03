import { Router } from "express";
import { db, produkTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function formatProduk(p: typeof produkTable.$inferSelect) {
  return {
    ...p,
    hargaBeli: Number(p.hargaBeli),
    hargaJual: Number(p.hargaJual),
    stok: Number(p.stok),
    createdAt: p.createdAt.toISOString(),
  };
}

// GET /produk
router.get("/produk", async (req, res) => {
  const { unitUsahaId, kategori } = req.query as Record<string, string>;
  const filters = [];
  if (unitUsahaId) filters.push(eq(produkTable.unitUsahaId, Number(unitUsahaId)));
  if (kategori) filters.push(eq(produkTable.kategori, kategori));

  const list = filters.length
    ? await db.select().from(produkTable).where(and(...filters))
    : await db.select().from(produkTable);

  res.json(list.map(formatProduk));
});

// POST /produk
router.post("/produk", async (req, res) => {
  const { unitUsahaId, nama, kategori, hargaBeli, hargaJual, stok, satuan } = req.body;
  if (!unitUsahaId || !nama || !kategori || hargaBeli === undefined || hargaJual === undefined) {
    res.status(400).json({ error: "Field wajib tidak lengkap" });
    return;
  }

  const [p] = await db.insert(produkTable).values({
    unitUsahaId: Number(unitUsahaId),
    nama, kategori,
    hargaBeli: String(hargaBeli),
    hargaJual: String(hargaJual),
    stok: String(stok ?? 0),
    satuan: satuan || "pcs",
  }).returning();

  res.status(201).json(formatProduk(p));
});

// PATCH /produk/:id
router.patch("/produk/:id", async (req, res) => {
  const { nama, hargaBeli, hargaJual, stok } = req.body;
  const updates: Partial<typeof produkTable.$inferInsert> = {};
  if (nama) updates.nama = nama;
  if (hargaBeli !== undefined) updates.hargaBeli = String(hargaBeli);
  if (hargaJual !== undefined) updates.hargaJual = String(hargaJual);
  if (stok !== undefined) updates.stok = String(stok);

  const [p] = await db.update(produkTable).set(updates).where(eq(produkTable.id, Number(req.params.id))).returning();
  if (!p) { res.status(404).json({ error: "Produk tidak ditemukan" }); return; }
  res.json(formatProduk(p));
});

export default router;
