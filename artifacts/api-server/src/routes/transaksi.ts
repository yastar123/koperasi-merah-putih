import { Router } from "express";
import { db, transaksiTable, produkTable, anggotaTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

function formatTransaksi(t: typeof transaksiTable.$inferSelect) {
  return {
    ...t,
    totalHarga: Number(t.totalHarga),
    items: t.items as unknown[],
    createdAt: t.createdAt.toISOString(),
  };
}

// GET /transaksi
router.get("/transaksi", async (req, res) => {
  const { unitUsahaId, koperasiId } = req.query as Record<string, string>;
  const filters = [];
  if (unitUsahaId) filters.push(eq(transaksiTable.unitUsahaId, Number(unitUsahaId)));

  const list = filters.length
    ? await db.select().from(transaksiTable).where(and(...filters))
    : await db.select().from(transaksiTable);

  // Enrich with anggota name
  const enriched = await Promise.all(list.map(async t => {
    let namaAnggota: string | null = null;
    if (t.anggotaId) {
      const [a] = await db.select({ nama: anggotaTable.nama }).from(anggotaTable).where(eq(anggotaTable.id, t.anggotaId)).limit(1);
      namaAnggota = a?.nama ?? null;
    }
    return { ...formatTransaksi(t), namaAnggota };
  }));

  res.json(enriched);
});

// POST /transaksi
router.post("/transaksi", async (req, res) => {
  const { unitUsahaId, anggotaId, items, tanggal, keterangan } = req.body;
  if (!unitUsahaId || !items?.length || !tanggal) {
    res.status(400).json({ error: "Field wajib tidak lengkap" });
    return;
  }

  let totalHarga = 0;
  const enrichedItems = [];

  for (const item of items) {
    const [produk] = await db.select().from(produkTable).where(eq(produkTable.id, item.produkId)).limit(1);
    if (!produk) continue;

    const subtotal = Number(produk.hargaJual) * item.qty;
    totalHarga += subtotal;

    enrichedItems.push({
      produkId: item.produkId,
      namaProduk: produk.nama,
      qty: item.qty,
      hargaSatuan: Number(produk.hargaJual),
      subtotal,
    });

    // Kurangi stok
    const newStok = Math.max(0, Number(produk.stok) - item.qty);
    await db.update(produkTable).set({ stok: String(newStok) }).where(eq(produkTable.id, item.produkId));
  }

  const session = req.cookies?.session || req.headers.authorization?.replace("Bearer ", "");
  let operatorId = 1;
  if (session) {
    try {
      const { userId } = JSON.parse(Buffer.from(session, "base64").toString("utf-8"));
      operatorId = userId;
    } catch {}
  }

  const [t] = await db.insert(transaksiTable).values({
    unitUsahaId: Number(unitUsahaId),
    anggotaId: anggotaId ? Number(anggotaId) : null,
    operatorId,
    totalHarga: String(totalHarga),
    tanggal,
    keterangan: keterangan || null,
    items: enrichedItems,
  }).returning();

  let namaAnggota: string | null = null;
  if (t.anggotaId) {
    const [a] = await db.select({ nama: anggotaTable.nama }).from(anggotaTable).where(eq(anggotaTable.id, t.anggotaId)).limit(1);
    namaAnggota = a?.nama ?? null;
  }

  res.status(201).json({ ...formatTransaksi(t), namaAnggota });
});

export default router;
