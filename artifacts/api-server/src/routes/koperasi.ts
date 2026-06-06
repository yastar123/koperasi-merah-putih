import { Router } from "express";
import { db, koperasiTable, anggotaTable, simpananTable, transaksiTable, unitUsahaTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

async function enrichKoperasi(k: typeof koperasiTable.$inferSelect) {
  const anggotaCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(anggotaTable)
    .where(and(eq(anggotaTable.koperasiId, k.id), eq(anggotaTable.status, "aktif")));

  const angIds = (await db.select({ id: anggotaTable.id }).from(anggotaTable).where(eq(anggotaTable.koperasiId, k.id))).map(a => a.id);
  let totalSimpanan = 0;
  if (angIds.length) {
    const [simpRow] = await db.select({ total: sql<number>`coalesce(sum(jumlah), 0)` })
      .from(simpananTable)
      .where(sql`anggota_id = ANY(${angIds}) AND jenis != 'penarikan'`);
    totalSimpanan = Number(simpRow?.total ?? 0);
  }

  const unitIds = (await db.select({ id: unitUsahaTable.id }).from(unitUsahaTable).where(eq(unitUsahaTable.koperasiId, k.id))).map(u => u.id);
  let totalOmzet = 0;
  if (unitIds.length) {
    const [omzetRow] = await db.select({ total: sql<number>`coalesce(sum(total_harga), 0)` })
      .from(transaksiTable)
      .where(sql`unit_usaha_id = ANY(${unitIds})`);
    totalOmzet = Number(omzetRow?.total ?? 0);
  }

  return {
    ...k,
    createdAt: k.createdAt.toISOString(),
    jumlahAnggota: Number(anggotaCount[0]?.count ?? 0),
    totalAset: totalSimpanan + totalOmzet,
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
  const { nama, noBadanHukum, desa, kecamatan, kabupaten, provinsi, alamat, telepon, email, tanggalBerdiri, logoUrl } = req.body;
  if (!nama || !desa || !kecamatan || !kabupaten || !provinsi) {
    res.status(400).json({ error: "Field wajib tidak lengkap" });
    return;
  }

  const [kop] = await db.insert(koperasiTable).values({
    nama, noBadanHukum: noBadanHukum || null, desa, kecamatan, kabupaten, provinsi,
    alamat: alamat || null, telepon: telepon || null, email: email || null,
    tanggalBerdiri: tanggalBerdiri || null, status: "pending",
    logoUrl: logoUrl || null,
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
  const { nama, noBadanHukum, alamat, telepon, email, status, logoUrl } = req.body;
  const updates: Partial<typeof koperasiTable.$inferInsert> = {};
  if (nama) updates.nama = nama;
  if (noBadanHukum !== undefined) updates.noBadanHukum = noBadanHukum;
  if (alamat !== undefined) updates.alamat = alamat;
  if (telepon !== undefined) updates.telepon = telepon;
  if (email !== undefined) updates.email = email;
  if (status) updates.status = status;
  if (logoUrl !== undefined) updates.logoUrl = logoUrl;

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
