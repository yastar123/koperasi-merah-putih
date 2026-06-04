import { Router } from "express";
import { db, koperasiTable, anggotaTable, simpananTable, pinjamanTable, transaksiTable, angsuranTable } from "@workspace/db";
import { eq, and, sql, gt } from "drizzle-orm";

const router = Router();

// GET /dashboard/stats
router.get("/dashboard/stats", async (req, res) => {
  const { koperasiId } = req.query as Record<string, string>;
  const kopId = koperasiId ? Number(koperasiId) : null;

  const anggotaFilter = kopId ? eq(anggotaTable.koperasiId, kopId) : sql`1=1`;

  const [totalAng] = await db.select({ c: sql<number>`count(*)` }).from(anggotaTable).where(anggotaFilter);
  const [aktifAng] = await db.select({ c: sql<number>`count(*)` }).from(anggotaTable).where(and(anggotaFilter, eq(anggotaTable.status, "aktif")));

  // Anggota baru bulan ini
  const firstDay = new Date();
  firstDay.setDate(1);
  const [baruAng] = await db.select({ c: sql<number>`count(*)` })
    .from(anggotaTable)
    .where(and(anggotaFilter, sql`created_at >= ${firstDay}`));

  // Total simpanan
  const angIds = kopId
    ? (await db.select({ id: anggotaTable.id }).from(anggotaTable).where(eq(anggotaTable.koperasiId, kopId))).map(a => a.id)
    : null;

  const simpananWhere = angIds?.length
    ? sql`anggota_id = ANY(${angIds}) AND jenis != 'penarikan'`
    : sql`jenis != 'penarikan'`;
  const [simpRow] = await db.select({ total: sql<number>`coalesce(sum(jumlah), 0)` }).from(simpananTable).where(simpananWhere);
  const totalSimpanan = Number(simpRow?.total ?? 0);

  // Pinjaman
  const pinjamanWhere = angIds?.length
    ? sql`anggota_id = ANY(${angIds}) AND status in ('disetujui', 'macet')`
    : sql`status in ('disetujui', 'macet')`;
  const [pinRow] = await db.select({ total: sql<number>`coalesce(sum(jumlah_pinjaman), 0)`, c: sql<number>`count(*)` }).from(pinjamanTable).where(pinjamanWhere);
  const totalPinjaman = Number(pinRow?.total ?? 0);
  const pinjamanAktif = Number(pinRow?.total ?? 0);

  // Tunggakan (angsuran terlambat)
  const [tgkRow] = await db.select({ total: sql<number>`coalesce(sum(jumlah_angsuran), 0)` })
    .from(angsuranTable).where(eq(angsuranTable.status, "terlambat"));
  const tunggakan = Number(tgkRow?.total ?? 0);

  // Omzet bulan ini
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const transaksiWhere = kopId
    ? sql`unit_usaha_id IN (SELECT id FROM unit_usaha WHERE koperasi_id = ${kopId}) AND tanggal >= ${firstOfMonth}`
    : sql`tanggal >= ${firstOfMonth}`;
  const [omzetRow] = await db.select({ total: sql<number>`coalesce(sum(total_harga), 0)` }).from(transaksiTable).where(transaksiWhere);
  const omzetBulanIni = Number(omzetRow?.total ?? 0);

  // Pengajuan pending
  const pendingWhere = angIds?.length
    ? sql`anggota_id = ANY(${angIds}) AND status = 'pending'`
    : sql`status = 'pending'`;
  const [pendingRow] = await db.select({ c: sql<number>`count(*)` }).from(pinjamanTable).where(pendingWhere);

  res.json({
    totalAnggota: Number(totalAng?.c ?? 0),
    anggotaAktif: Number(aktifAng?.c ?? 0),
    anggotaBaru: Number(baruAng?.c ?? 0),
    totalSimpanan,
    totalPinjaman,
    pinjamanAktif,
    tunggakan,
    omzetBulanIni,
    pengajuanPending: Number(pendingRow?.c ?? 0),
  });
});

// GET /dashboard/aktivitas-terbaru
router.get("/dashboard/aktivitas-terbaru", async (req, res) => {
  const { koperasiId, limit } = req.query as Record<string, string>;
  const lim = limit ? Number(limit) : 10;

  // Combine recent activities from multiple tables
  const activities = [];

  const recentAnggota = await db.select().from(anggotaTable).orderBy(sql`created_at DESC`).limit(3);
  for (const a of recentAnggota) {
    activities.push({
      id: a.id,
      tipe: "anggota_baru",
      deskripsi: `Anggota baru: ${a.nama} (${a.nomorAnggota})`,
      waktu: a.createdAt.toISOString(),
      userId: a.userId,
      namaUser: a.nama,
    });
  }

  const recentPinjaman = await db.select().from(pinjamanTable).orderBy(sql`created_at DESC`).limit(3);
  for (const p of recentPinjaman) {
    activities.push({
      id: p.id + 1000,
      tipe: "pengajuan_pinjaman",
      deskripsi: `Pengajuan pinjaman Rp ${Number(p.jumlahPinjaman).toLocaleString("id")} — status: ${p.status}`,
      waktu: p.createdAt.toISOString(),
      userId: null,
      namaUser: null,
    });
  }

  const recentTransaksi = await db.select().from(transaksiTable).orderBy(sql`created_at DESC`).limit(3);
  for (const t of recentTransaksi) {
    activities.push({
      id: t.id + 2000,
      tipe: "transaksi",
      deskripsi: `Transaksi unit usaha senilai Rp ${Number(t.totalHarga).toLocaleString("id")}`,
      waktu: t.createdAt.toISOString(),
      userId: t.operatorId,
      namaUser: null,
    });
  }

  activities.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());
  res.json(activities.slice(0, lim));
});

// GET /dashboard/pinjaman-jatuh-tempo
router.get("/dashboard/pinjaman-jatuh-tempo", async (req, res) => {
  const { koperasiId } = req.query as Record<string, string>;

  const now = new Date();
  const twoWeeksLater = new Date(now);
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  const today = now.toISOString().split("T")[0];
  const deadline = twoWeeksLater.toISOString().split("T")[0];

  const list = await db.select().from(angsuranTable)
    .where(and(eq(angsuranTable.status, "belum_bayar"), sql`tanggal_jatuh_tempo <= ${deadline}`))
    .limit(20);

  const enriched = await Promise.all(list.map(async a => {
    const [p] = await db.select({ anggotaId: pinjamanTable.anggotaId }).from(pinjamanTable).where(eq(pinjamanTable.id, a.pinjamanId)).limit(1);
    const anggotaId = p?.anggotaId ?? 0;
    const [ang] = await db.select({ nama: anggotaTable.nama }).from(anggotaTable).where(eq(anggotaTable.id, anggotaId)).limit(1);
    const isLate = a.tanggalJatuhTempo < today;
    return {
      ...a,
      anggotaId,
      namaAnggota: ang?.nama ?? "",
      jumlahAngsuran: Number(a.jumlahAngsuran),
      jumlahDibayar: a.jumlahDibayar ? Number(a.jumlahDibayar) : null,
      status: isLate ? "terlambat" : a.status,
      createdAt: a.createdAt.toISOString(),
    };
  }));

  res.json(enriched);
});

// GET /dashboard/nasional
router.get("/dashboard/nasional", async (req, res) => {
  const [total] = await db.select({ c: sql<number>`count(*)` }).from(koperasiTable);
  const [aktif] = await db.select({ c: sql<number>`count(*)` }).from(koperasiTable).where(eq(koperasiTable.status, "aktif"));
  const [pending] = await db.select({ c: sql<number>`count(*)` }).from(koperasiTable).where(eq(koperasiTable.status, "pending"));
  const [totalAng] = await db.select({ c: sql<number>`count(*)` }).from(anggotaTable);
  const [totalSimpRow] = await db.select({ total: sql<number>`coalesce(sum(jumlah), 0)` }).from(simpananTable).where(sql`jenis != 'penarikan'`);
  const [totalOmzetRow] = await db.select({ total: sql<number>`coalesce(sum(total_harga), 0)` }).from(transaksiTable);

  const sebaranRows = await db.select({
    provinsi: koperasiTable.provinsi,
    jumlahKoperasi: sql<number>`count(*)`,
  }).from(koperasiTable).groupBy(koperasiTable.provinsi);

  const sebaran = await Promise.all(sebaranRows.map(async s => {
    const kopIds = (await db.select({ id: koperasiTable.id }).from(koperasiTable).where(eq(koperasiTable.provinsi, s.provinsi))).map(k => k.id);
    const [angCount] = await db.select({ c: sql<number>`count(*)` })
      .from(anggotaTable)
      .where(kopIds.length ? sql`koperasi_id = ANY(${kopIds})` : sql`1=0`);
    return { provinsi: s.provinsi, jumlahKoperasi: Number(s.jumlahKoperasi), jumlahAnggota: Number(angCount?.c ?? 0) };
  }));

  const totalAset = Number(totalSimpRow?.total ?? 0) + Number(totalOmzetRow?.total ?? 0);

  res.json({
    totalKoperasi: Number(total?.c ?? 0),
    koperasiAktif: Number(aktif?.c ?? 0),
    koperasiPending: Number(pending?.c ?? 0),
    totalAnggota: Number(totalAng?.c ?? 0),
    totalAset,
    sebaran,
  });
});

export default router;
