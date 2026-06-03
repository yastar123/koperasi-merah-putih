import { Router } from "express";
import { db, pinjamanTable, angsuranTable, anggotaTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

function calcAngsuran(pokok: number, bungaPersen: number, tenor: number) {
  const bungaBulanan = bungaPersen / 100;
  const angsuranPokok = pokok / tenor;
  return angsuranPokok + (pokok * bungaBulanan);
}

async function enrichPinjaman(p: typeof pinjamanTable.$inferSelect) {
  const [a] = await db.select({ nama: anggotaTable.nama }).from(anggotaTable).where(eq(anggotaTable.id, p.anggotaId)).limit(1);

  const angsuranLunas = await db.select({ total: sql<number>`coalesce(sum(jumlah_dibayar), 0)` })
    .from(angsuranTable).where(and(eq(angsuranTable.pinjamanId, p.id), eq(angsuranTable.status, "lunas")));

  const sudahBayar = Number(angsuranLunas[0]?.total ?? 0);
  const sisaPinjaman = Math.max(0, Number(p.jumlahPinjaman) - sudahBayar);

  return {
    ...p,
    jumlahPinjaman: Number(p.jumlahPinjaman),
    bungaPersen: Number(p.bungaPersen),
    angsuranPerBulan: p.angsuranPerBulan ? Number(p.angsuranPerBulan) : 0,
    namaAnggota: a?.nama ?? "",
    sisaPinjaman,
    createdAt: p.createdAt.toISOString(),
  };
}

// GET /pinjaman
router.get("/pinjaman", async (req, res) => {
  const { anggotaId, koperasiId, status } = req.query as Record<string, string>;
  const filters = [];
  if (anggotaId) filters.push(eq(pinjamanTable.anggotaId, Number(anggotaId)));
  if (status) filters.push(eq(pinjamanTable.status, status));

  if (koperasiId) {
    const ids = (await db.select({ id: anggotaTable.id }).from(anggotaTable).where(eq(anggotaTable.koperasiId, Number(koperasiId)))).map(a => a.id);
    const list = ids.length
      ? await db.select().from(pinjamanTable).where(
          filters.length ? and(...filters, sql`${pinjamanTable.anggotaId} = ANY(${ids})`) : sql`${pinjamanTable.anggotaId} = ANY(${ids})`
        )
      : [];
    res.json(await Promise.all(list.map(enrichPinjaman)));
    return;
  }

  const list = filters.length
    ? await db.select().from(pinjamanTable).where(and(...filters))
    : await db.select().from(pinjamanTable);

  res.json(await Promise.all(list.map(enrichPinjaman)));
});

// POST /pinjaman
router.post("/pinjaman", async (req, res) => {
  const { anggotaId, jumlahPinjaman, tenorBulan, tujuan } = req.body;
  if (!anggotaId || !jumlahPinjaman || !tenorBulan) {
    res.status(400).json({ error: "Field wajib tidak lengkap" });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const [p] = await db.insert(pinjamanTable).values({
    anggotaId: Number(anggotaId),
    jumlahPinjaman: String(jumlahPinjaman),
    bungaPersen: "1.5",
    tenorBulan: Number(tenorBulan),
    tujuan: tujuan || null,
    status: "pending",
    tanggalPengajuan: today,
  }).returning();

  res.status(201).json(await enrichPinjaman(p));
});

// GET /pinjaman/:id
router.get("/pinjaman/:id", async (req, res) => {
  const [p] = await db.select().from(pinjamanTable).where(eq(pinjamanTable.id, Number(req.params.id))).limit(1);
  if (!p) { res.status(404).json({ error: "Pinjaman tidak ditemukan" }); return; }
  res.json(await enrichPinjaman(p));
});

// POST /pinjaman/:id/setujui
router.post("/pinjaman/:id/setujui", async (req, res) => {
  const { status, bungaPersen, catatanPengurus } = req.body;
  if (!status) { res.status(400).json({ error: "Status wajib" }); return; }

  const pinjamanId = Number(req.params.id);
  const [existing] = await db.select().from(pinjamanTable).where(eq(pinjamanTable.id, pinjamanId)).limit(1);
  if (!existing) { res.status(404).json({ error: "Pinjaman tidak ditemukan" }); return; }

  const bunga = bungaPersen ?? 1.5;
  const angsuran = calcAngsuran(Number(existing.jumlahPinjaman), bunga, existing.tenorBulan);
  const today = new Date();
  const jatuhTempo = new Date(today);
  jatuhTempo.setMonth(jatuhTempo.getMonth() + existing.tenorBulan);

  const [p] = await db.update(pinjamanTable).set({
    status,
    bungaPersen: String(bunga),
    angsuranPerBulan: String(angsuran),
    catatanPengurus: catatanPengurus || null,
    tanggalDisetujui: status === "disetujui" ? today.toISOString().split("T")[0] : null,
    tanggalJatuhTempo: status === "disetujui" ? jatuhTempo.toISOString().split("T")[0] : null,
  }).where(eq(pinjamanTable.id, pinjamanId)).returning();

  // Generate jadwal angsuran
  if (status === "disetujui") {
    const jadwal = [];
    for (let i = 1; i <= existing.tenorBulan; i++) {
      const tgl = new Date(today);
      tgl.setMonth(tgl.getMonth() + i);
      jadwal.push({
        pinjamanId,
        periodeKe: i,
        jumlahAngsuran: String(Math.round(angsuran)),
        tanggalJatuhTempo: tgl.toISOString().split("T")[0],
        status: "belum_bayar",
      });
    }
    await db.insert(angsuranTable).values(jadwal);
  }

  res.json(await enrichPinjaman(p));
});

export default router;
