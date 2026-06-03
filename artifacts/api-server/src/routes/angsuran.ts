import { Router } from "express";
import { db, angsuranTable, pinjamanTable, anggotaTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

async function enrichAngsuran(a: typeof angsuranTable.$inferSelect) {
  const [p] = await db.select({ anggotaId: pinjamanTable.anggotaId }).from(pinjamanTable).where(eq(pinjamanTable.id, a.pinjamanId)).limit(1);
  const anggotaId = p?.anggotaId ?? 0;
  const [ang] = await db.select({ nama: anggotaTable.nama }).from(anggotaTable).where(eq(anggotaTable.id, anggotaId)).limit(1);

  return {
    ...a,
    anggotaId,
    namaAnggota: ang?.nama ?? "",
    jumlahAngsuran: Number(a.jumlahAngsuran),
    jumlahDibayar: a.jumlahDibayar ? Number(a.jumlahDibayar) : null,
    createdAt: a.createdAt.toISOString(),
  };
}

// GET /angsuran
router.get("/angsuran", async (req, res) => {
  const { pinjamanId, anggotaId, status } = req.query as Record<string, string>;
  const filters = [];
  if (pinjamanId) filters.push(eq(angsuranTable.pinjamanId, Number(pinjamanId)));
  if (status) filters.push(eq(angsuranTable.status, status));

  if (anggotaId) {
    const pIds = (await db.select({ id: pinjamanTable.id }).from(pinjamanTable).where(eq(pinjamanTable.anggotaId, Number(anggotaId)))).map(p => p.id);
    const list = pIds.length
      ? await db.select().from(angsuranTable).where(
          filters.length ? and(...filters, sql`${angsuranTable.pinjamanId} = ANY(${pIds})`) : sql`${angsuranTable.pinjamanId} = ANY(${pIds})`
        )
      : [];
    res.json(await Promise.all(list.map(enrichAngsuran)));
    return;
  }

  const list = filters.length
    ? await db.select().from(angsuranTable).where(and(...filters))
    : await db.select().from(angsuranTable);

  res.json(await Promise.all(list.map(enrichAngsuran)));
});

// POST /angsuran (bayar angsuran)
router.post("/angsuran", async (req, res) => {
  const { angsuranId, jumlahDibayar, tanggalBayar } = req.body;
  if (!angsuranId || !jumlahDibayar || !tanggalBayar) {
    res.status(400).json({ error: "Field wajib tidak lengkap" });
    return;
  }

  const [updated] = await db.update(angsuranTable).set({
    jumlahDibayar: String(jumlahDibayar),
    tanggalBayar,
    status: "lunas",
  }).where(eq(angsuranTable.id, Number(angsuranId))).returning();

  if (!updated) { res.status(404).json({ error: "Angsuran tidak ditemukan" }); return; }

  // Cek apakah semua angsuran sudah lunas
  const belumLunas = await db.select({ c: sql<number>`count(*)` })
    .from(angsuranTable)
    .where(and(eq(angsuranTable.pinjamanId, updated.pinjamanId), sql`status != 'lunas'`));

  if (Number(belumLunas[0]?.c ?? 0) === 0) {
    await db.update(pinjamanTable).set({ status: "lunas" }).where(eq(pinjamanTable.id, updated.pinjamanId));
  }

  res.status(201).json(await enrichAngsuran(updated));
});

export default router;
