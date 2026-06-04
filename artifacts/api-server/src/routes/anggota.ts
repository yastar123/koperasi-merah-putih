import { Router } from "express";
import { db, anggotaTable, simpananTable, pinjamanTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

async function enrichAnggota(a: typeof anggotaTable.$inferSelect) {
  const saldoRows = await db.select({ jenis: simpananTable.jenis, total: sql<number>`sum(jumlah)` })
    .from(simpananTable).where(eq(simpananTable.anggotaId, a.id)).groupBy(simpananTable.jenis);

  let totalSimpanan = 0;
  for (const r of saldoRows) {
    const amt = Number(r.total);
    if (r.jenis === "penarikan") totalSimpanan -= amt;
    else totalSimpanan += amt;
  }

  const [pinRow] = await db.select({ total: sql<number>`coalesce(sum(jumlah_pinjaman), 0)` })
    .from(pinjamanTable)
    .where(and(eq(pinjamanTable.anggotaId, a.id), sql`status in ('disetujui', 'macet')`));
  const totalPinjaman = Number(pinRow?.total ?? 0);

  return { ...a, createdAt: a.createdAt.toISOString(), totalSimpanan, totalPinjaman };
}

// GET /anggota
router.get("/anggota", async (req, res) => {
  const { koperasiId, status, userId } = req.query as Record<string, string>;
  const filters = [];
  if (koperasiId) filters.push(eq(anggotaTable.koperasiId, Number(koperasiId)));
  if (status) filters.push(eq(anggotaTable.status, status));
  if (userId) filters.push(eq(anggotaTable.userId, Number(userId)));

  const list = filters.length
    ? await db.select().from(anggotaTable).where(and(...filters))
    : await db.select().from(anggotaTable);

  const enriched = await Promise.all(list.map(enrichAnggota));
  res.json(enriched);
});

// POST /anggota
router.post("/anggota", async (req, res) => {
  const { nama, nik, tempatLahir, tanggalLahir, alamat, telepon, pekerjaan, koperasiId, userId } = req.body;
  if (!nama || !nik || !koperasiId) {
    res.status(400).json({ error: "Field wajib tidak lengkap" });
    return;
  }

  const count = await db.select({ c: sql<number>`count(*)` }).from(anggotaTable).where(eq(anggotaTable.koperasiId, koperasiId));
  const nomorAnggota = `ANG-${koperasiId}-${String(Number(count[0]?.c ?? 0) + 1).padStart(4, "0")}`;

  const [a] = await db.insert(anggotaTable).values({
    nomorAnggota, nama, nik,
    tempatLahir: tempatLahir || null, tanggalLahir: tanggalLahir || null,
    alamat: alamat || null, telepon: telepon || null, pekerjaan: pekerjaan || null,
    koperasiId: Number(koperasiId), userId: userId || null, status: "pending",
  }).returning();

  res.status(201).json(await enrichAnggota(a));
});

// GET /anggota/:id
router.get("/anggota/:id", async (req, res) => {
  const [a] = await db.select().from(anggotaTable).where(eq(anggotaTable.id, Number(req.params.id))).limit(1);
  if (!a) { res.status(404).json({ error: "Anggota tidak ditemukan" }); return; }
  res.json(await enrichAnggota(a));
});

// PATCH /anggota/:id
router.patch("/anggota/:id", async (req, res) => {
  const { nama, alamat, telepon, pekerjaan, status } = req.body;
  const updates: Partial<typeof anggotaTable.$inferInsert> = {};
  if (nama) updates.nama = nama;
  if (alamat !== undefined) updates.alamat = alamat;
  if (telepon !== undefined) updates.telepon = telepon;
  if (pekerjaan !== undefined) updates.pekerjaan = pekerjaan;
  if (status) updates.status = status;

  const [a] = await db.update(anggotaTable).set(updates).where(eq(anggotaTable.id, Number(req.params.id))).returning();
  if (!a) { res.status(404).json({ error: "Anggota tidak ditemukan" }); return; }
  res.json(await enrichAnggota(a));
});

// POST /anggota/:id/verifikasi
router.post("/anggota/:id/verifikasi", async (req, res) => {
  const { status } = req.body;
  if (!status) { res.status(400).json({ error: "Status wajib" }); return; }

  const [a] = await db.update(anggotaTable).set({ status }).where(eq(anggotaTable.id, Number(req.params.id))).returning();
  if (!a) { res.status(404).json({ error: "Anggota tidak ditemukan" }); return; }
  res.json(await enrichAnggota(a));
});

export default router;
