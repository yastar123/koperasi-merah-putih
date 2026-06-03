import { Router } from "express";
import { db, unitUsahaTable, transaksiTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

async function enrichUnit(u: typeof unitUsahaTable.$inferSelect) {
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const [omzet] = await db.select({ total: sql<number>`coalesce(sum(total_harga), 0)` })
    .from(transaksiTable)
    .where(and(eq(transaksiTable.unitUsahaId, u.id), sql`tanggal >= ${firstDay}`));

  return { ...u, createdAt: u.createdAt.toISOString(), omzetBulanIni: Number(omzet?.total ?? 0) };
}

// GET /unit-usaha
router.get("/unit-usaha", async (req, res) => {
  const { koperasiId, jenis } = req.query as Record<string, string>;
  const filters = [];
  if (koperasiId) filters.push(eq(unitUsahaTable.koperasiId, Number(koperasiId)));
  if (jenis) filters.push(eq(unitUsahaTable.jenis, jenis));

  const list = filters.length
    ? await db.select().from(unitUsahaTable).where(and(...filters))
    : await db.select().from(unitUsahaTable);

  res.json(await Promise.all(list.map(enrichUnit)));
});

// POST /unit-usaha
router.post("/unit-usaha", async (req, res) => {
  const { koperasiId, nama, jenis, deskripsi } = req.body;
  if (!koperasiId || !nama || !jenis) {
    res.status(400).json({ error: "Field wajib tidak lengkap" });
    return;
  }

  const [u] = await db.insert(unitUsahaTable).values({
    koperasiId: Number(koperasiId), nama, jenis, deskripsi: deskripsi || null, aktif: true,
  }).returning();

  res.status(201).json(await enrichUnit(u));
});

export default router;
