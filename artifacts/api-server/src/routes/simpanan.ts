import { Router } from "express";
import { db, simpananTable, anggotaTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

async function withNama(s: typeof simpananTable.$inferSelect) {
  const [a] = await db.select({ nama: anggotaTable.nama }).from(anggotaTable).where(eq(anggotaTable.id, s.anggotaId)).limit(1);
  return {
    ...s,
    jumlah: Number(s.jumlah),
    namaAnggota: a?.nama ?? "",
    tanggal: s.tanggal,
    createdAt: s.createdAt.toISOString(),
  };
}

// GET /simpanan
router.get("/simpanan", async (req, res) => {
  const { anggotaId, koperasiId, jenis } = req.query as Record<string, string>;
  const filters = [];
  if (anggotaId) filters.push(eq(simpananTable.anggotaId, Number(anggotaId)));
  if (jenis) filters.push(eq(simpananTable.jenis, jenis));

  if (koperasiId) {
    const anggotaIds = await db.select({ id: anggotaTable.id }).from(anggotaTable).where(eq(anggotaTable.koperasiId, Number(koperasiId)));
    const ids = anggotaIds.map(a => a.id);
    const list = ids.length
      ? await db.select().from(simpananTable).where(
          filters.length ? and(...filters, sql`${simpananTable.anggotaId} = ANY(${ids})`) : sql`${simpananTable.anggotaId} = ANY(${ids})`
        )
      : [];
    res.json(await Promise.all(list.map(withNama)));
    return;
  }

  const list = filters.length
    ? await db.select().from(simpananTable).where(and(...filters))
    : await db.select().from(simpananTable);

  res.json(await Promise.all(list.map(withNama)));
});

// POST /simpanan
router.post("/simpanan", async (req, res) => {
  const { anggotaId, jenis, jumlah, tanggal, keterangan } = req.body;
  if (!anggotaId || !jenis || !jumlah || !tanggal) {
    res.status(400).json({ error: "Field wajib tidak lengkap" });
    return;
  }

  const [s] = await db.insert(simpananTable).values({
    anggotaId: Number(anggotaId),
    jenis,
    jumlah: String(jumlah),
    tanggal,
    keterangan: keterangan || null,
  }).returning();

  res.status(201).json(await withNama(s));
});

// GET /simpanan/saldo/:anggotaId
router.get("/simpanan/saldo/:anggotaId", async (req, res) => {
  const anggotaId = Number(req.params.anggotaId);
  const [a] = await db.select({ nama: anggotaTable.nama }).from(anggotaTable).where(eq(anggotaTable.id, anggotaId)).limit(1);

  const rows = await db.select({ jenis: simpananTable.jenis, total: sql<number>`sum(jumlah)` })
    .from(simpananTable)
    .where(eq(simpananTable.anggotaId, anggotaId))
    .groupBy(simpananTable.jenis);

  const saldo = { pokok: 0, wajib: 0, sukarela: 0, penarikan: 0 };
  for (const r of rows) saldo[r.jenis as keyof typeof saldo] = Number(r.total);

  const total = saldo.pokok + saldo.wajib + saldo.sukarela - saldo.penarikan;

  res.json({
    anggotaId,
    namaAnggota: a?.nama ?? "",
    simpananPokok: saldo.pokok,
    simpananWajib: saldo.wajib,
    simpananSukarela: saldo.sukarela,
    totalSimpanan: total,
  });
});

export default router;
