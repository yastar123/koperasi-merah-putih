import { Router } from "express";
import { db, koperasiTable, anggotaTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

async function enrichKoperasi(k: typeof koperasiTable.$inferSelect) {
  const anggotaCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(anggotaTable)
    .where(and(eq(anggotaTable.koperasiId, k.id), eq(anggotaTable.status, "aktif")));

  return {
    ...k,
    createdAt: k.createdAt.toISOString(),
    jumlahAnggota: Number(anggotaCount[0]?.count ?? 0),
    totalAset: 0,
  };
}

// GET /koperasi
router.get("/koperasi", async (req, res) => {
  const { status, provinsi } = req.query as Record<string, string>;
  const filters = [];
  if (status) filters.push(eq(koperasiTable.status, status));
  if (provinsi) filters.push(eq(koperasiTable.provinsi, provinsi));

  const list = filters.length
    ? await db.select().from(koperasiTable).where(and(...filters))
    : await db.select().from(koperasiTable);

  const enriched = await Promise.all(list.map(enrichKoperasi));
  res.json(enriched);
});

// POST /koperasi
router.post("/koperasi", async (req, res) => {
  const { nama, noBadanHukum, desa, kecamatan, kabupaten, provinsi, alamat, telepon, email, tanggalBerdiri } = req.body;
  if (!nama || !desa || !kecamatan || !kabupaten || !provinsi) {
    res.status(400).json({ error: "Field wajib tidak lengkap" });
    return;
  }

  const [kop] = await db.insert(koperasiTable).values({
    nama, noBadanHukum: noBadanHukum || null, desa, kecamatan, kabupaten, provinsi,
    alamat: alamat || null, telepon: telepon || null, email: email || null,
    tanggalBerdiri: tanggalBerdiri || null, status: "pending",
  }).returning();

  res.status(201).json(await enrichKoperasi(kop));
});

// GET /koperasi/:id
router.get("/koperasi/:id", async (req, res) => {
  const [kop] = await db.select().from(koperasiTable).where(eq(koperasiTable.id, Number(req.params.id))).limit(1);
  if (!kop) { res.status(404).json({ error: "Koperasi tidak ditemukan" }); return; }
  res.json(await enrichKoperasi(kop));
});

// PATCH /koperasi/:id
router.patch("/koperasi/:id", async (req, res) => {
  const { nama, noBadanHukum, alamat, telepon, email, status } = req.body;
  const updates: Partial<typeof koperasiTable.$inferInsert> = {};
  if (nama) updates.nama = nama;
  if (noBadanHukum !== undefined) updates.noBadanHukum = noBadanHukum;
  if (alamat !== undefined) updates.alamat = alamat;
  if (telepon !== undefined) updates.telepon = telepon;
  if (email !== undefined) updates.email = email;
  if (status) updates.status = status;

  const [kop] = await db.update(koperasiTable).set(updates).where(eq(koperasiTable.id, Number(req.params.id))).returning();
  if (!kop) { res.status(404).json({ error: "Koperasi tidak ditemukan" }); return; }
  res.json(await enrichKoperasi(kop));
});

// POST /koperasi/:id/verifikasi
router.post("/koperasi/:id/verifikasi", async (req, res) => {
  const { status, catatan } = req.body;
  if (!status) { res.status(400).json({ error: "Status wajib" }); return; }

  const [kop] = await db.update(koperasiTable)
    .set({ status, catatan: catatan || null })
    .where(eq(koperasiTable.id, Number(req.params.id)))
    .returning();

  if (!kop) { res.status(404).json({ error: "Koperasi tidak ditemukan" }); return; }
  res.json(await enrichKoperasi(kop));
});

export default router;
