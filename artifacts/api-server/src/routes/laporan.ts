import { Router } from "express";
import { db, simpananTable, pinjamanTable, transaksiTable, anggotaTable, unitUsahaTable } from "@workspace/db";
import { eq, and, sql, gte, lte } from "drizzle-orm";

const router = Router();

// GET /laporan/keuangan
router.get("/laporan/keuangan", async (req, res) => {
  const { koperasiId, tahun, bulan } = req.query as Record<string, string>;
  const kopId = koperasiId ? Number(koperasiId) : null;
  const yr = tahun ? Number(tahun) : new Date().getFullYear();

  // Get anggota IDs
  const angQuery = kopId
    ? await db.select({ id: anggotaTable.id }).from(anggotaTable).where(eq(anggotaTable.koperasiId, kopId))
    : await db.select({ id: anggotaTable.id }).from(anggotaTable);
  const angIds = angQuery.map(a => a.id);

  // Total simpanan (filtered by koperasiId via angIds)
  const simpananWhere = angIds.length
    ? sql`jenis != 'penarikan' AND anggota_id = ANY(${angIds})`
    : sql`jenis != 'penarikan'`;
  const [simpananRow] = await db.select({ total: sql<number>`coalesce(sum(jumlah), 0)` })
    .from(simpananTable)
    .where(simpananWhere);
  const totalSimpanan = Number(simpananRow?.total ?? 0);

  // Total pinjaman aktif
  const [pinjamanRow] = await db.select({ total: sql<number>`coalesce(sum(jumlah_pinjaman), 0)` })
    .from(pinjamanTable)
    .where(sql`status in ('aktif', 'macet')`);
  const totalPinjaman = Number(pinjamanRow?.total ?? 0);

  // Unit omzet
  const unitList = kopId
    ? await db.select().from(unitUsahaTable).where(eq(unitUsahaTable.koperasiId, kopId))
    : await db.select().from(unitUsahaTable);

  const rincianUnit = await Promise.all(unitList.map(async u => {
    const [omzetRow] = await db.select({ total: sql<number>`coalesce(sum(total_harga), 0)` })
      .from(transaksiTable).where(eq(transaksiTable.unitUsahaId, u.id));
    const omzet = Number(omzetRow?.total ?? 0);
    return { unitUsahaId: u.id, namaUnit: u.nama, omzet, labaUnit: omzet * 0.15 };
  }));

  const totalOmzet = rincianUnit.reduce((s, u) => s + u.omzet, 0);
  const totalLaba = rincianUnit.reduce((s, u) => s + u.labaUnit, 0);

  // Monthly trend data: simpanan + transaksi per bulan for the given year
  const monthlyData = await Promise.all(
    Array.from({ length: 12 }, (_, i) => i + 1).map(async (m) => {
      const monthStr = String(m).padStart(2, "0");
      const prefix = `${yr}-${monthStr}`;

      const [simpRow] = await db
        .select({ total: sql<number>`coalesce(sum(jumlah), 0)` })
        .from(simpananTable)
        .where(sql`jenis != 'penarikan' AND tanggal LIKE ${prefix + "%"}`);

      const [txRow] = await db
        .select({ total: sql<number>`coalesce(sum(total_harga), 0)` })
        .from(transaksiTable)
        .where(sql`tanggal LIKE ${prefix + "%"}`);

      const [pinRow] = await db
        .select({ total: sql<number>`coalesce(sum(jumlah_pinjaman), 0)` })
        .from(pinjamanTable)
        .where(sql`status in ('aktif', 'macet') AND tanggal_pengajuan LIKE ${prefix + "%"}`);

      return {
        bulan: m,
        pemasukan: Number(simpRow?.total ?? 0) + Number(txRow?.total ?? 0),
        pengeluaran: Number(pinRow?.total ?? 0),
      };
    })
  );

  res.json({
    koperasiId: kopId ?? 0,
    tahun: yr,
    bulan: bulan ? Number(bulan) : null,
    totalPemasukan: totalSimpanan + totalOmzet,
    totalPengeluaran: totalPinjaman,
    labaRugi: totalLaba,
    totalSimpanan,
    totalPinjaman,
    totalAset: totalSimpanan + totalOmzet,
    rincianUnit,
    monthlyData,
  });
});

// GET /laporan/shu
router.get("/laporan/shu", async (req, res) => {
  const { koperasiId, tahun } = req.query as Record<string, string>;
  const kopId = koperasiId ? Number(koperasiId) : 1;
  const yr = tahun ? Number(tahun) : new Date().getFullYear();

  const anggotaList = await db.select().from(anggotaTable).where(and(eq(anggotaTable.koperasiId, kopId), eq(anggotaTable.status, "aktif")));

  // Total SHU = 15% dari omzet unit usaha
  const [omzetRow] = await db.select({ total: sql<number>`coalesce(sum(total_harga), 0)` }).from(transaksiTable);
  const totalShu = Number(omzetRow?.total ?? 0) * 0.15;

  const shuPerAnggota = await Promise.all(anggotaList.map(async a => {
    const [saldoRow] = await db.select({ total: sql<number>`coalesce(sum(jumlah), 0)` })
      .from(simpananTable).where(and(eq(simpananTable.anggotaId, a.id), sql`jenis != 'penarikan'`));
    const [belanjaRow] = await db.select({ total: sql<number>`coalesce(sum(total_harga), 0)` })
      .from(transaksiTable).where(eq(transaksiTable.anggotaId, a.id));

    const simpanan = Number(saldoRow?.total ?? 0);
    const belanja = Number(belanjaRow?.total ?? 0);
    const bagian = totalShu > 0 ? (simpanan / (anggotaList.length * 1000000 || 1)) * (totalShu * 0.4) + (belanja / 1000000) * (totalShu * 0.6) : 0;

    return { anggotaId: a.id, namaAnggota: a.nama, totalSimpanan: simpanan, totalBelanja: belanja, bagianShu: Math.round(bagian / anggotaList.length) };
  }));

  res.json({ koperasiId: kopId, tahun: yr, totalShu, shuPerAnggota });
});

// GET /laporan/audit
router.get("/laporan/audit", async (req, res) => {
  const { koperasiId, tahun } = req.query as Record<string, string>;
  const kopId = koperasiId ? Number(koperasiId) : 1;
  const yr = tahun ? Number(tahun) : new Date().getFullYear();

  const [macetRow] = await db.select({ c: sql<number>`count(*)` }).from(pinjamanTable).where(eq(pinjamanTable.status, "macet"));
  const macet = Number(macetRow?.c ?? 0);

  const skor = Math.max(60, 100 - macet * 5);

  res.json({
    koperasiId: kopId,
    tahun: yr,
    temuan: macet > 0 ? [`Terdapat ${macet} pinjaman bermasalah (macet)`, "Perlu peningkatan proses seleksi calon debitur"] : ["Tidak ada temuan signifikan"],
    rekomendasi: ["Tingkatkan frekuensi sosialisasi simpan pinjam kepada anggota", "Pertahankan rasio NPL di bawah 5%", "Lakukan rapat koordinasi bulanan pengurus"],
    skorKesehatan: skor,
    statusKeuangan: skor >= 80 ? "Sehat" : skor >= 60 ? "Cukup Sehat" : "Perlu Perhatian",
  });
});

export default router;
