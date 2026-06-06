import { db, pool } from "@workspace/db";
import {
  usersTable,
  koperasiTable,
  anggotaTable,
  simpananTable,
  pinjamanTable,
  angsuranTable,
  unitUsahaTable,
  produkTable,
  transaksiTable,
  aktivitasLogTable,
} from "@workspace/db";
import * as crypto from "crypto";

function hash(password: string) {
  return crypto.createHash("sha256").update(password + "koperasi_salt").digest("hex");
}

const PW = hash("password123");

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function monthStr(monthsAgo: number, day = 1): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo, day);
  return d.toISOString().split("T")[0];
}

async function main() {
  console.log("🌱 Memulai seed database...");

  // ─── TRUNCATE ALL TABLES ────────────────────────────────────────────────────
  await pool.query(`
    TRUNCATE TABLE aktivitas_log, transaksi, produk, unit_usaha, angsuran, pinjaman, simpanan, anggota, users, koperasi
    RESTART IDENTITY CASCADE;
  `);
  console.log("✅ Tabel dikosongkan");

  // ─── KOPERASI ────────────────────────────────────────────────────────────────
  const koperasiData = [
    {
      nama: "Koperasi Desa Sukamaju",
      noBadanHukum: "518/BH/KWK.11/IX/2019",
      desa: "Sukamaju",
      kecamatan: "Ciawi",
      kabupaten: "Bogor",
      provinsi: "Jawa Barat",
      alamat: "Jl. Raya Sukamaju No. 12, Desa Sukamaju",
      telepon: "0251-8765432",
      email: "kopsukamaju@gmail.com",
      status: "aktif",
      tanggalBerdiri: "2019-09-15",
      catatan: "Koperasi unggulan kabupaten Bogor tahun 2023",
    },
    {
      nama: "Koperasi Desa Mekarjaya",
      noBadanHukum: "518/BH/KWK.11/III/2020",
      desa: "Mekarjaya",
      kecamatan: "Parung",
      kabupaten: "Bogor",
      provinsi: "Jawa Barat",
      alamat: "Jl. Mekarjaya Raya No. 5",
      telepon: "0251-7654321",
      email: "kopmekarjaya@gmail.com",
      status: "aktif",
      tanggalBerdiri: "2020-03-10",
      catatan: null,
    },
    {
      nama: "Koperasi Desa Sari Murni",
      noBadanHukum: "518/BH/KWK.33/VI/2021",
      desa: "Sari Murni",
      kecamatan: "Wonosari",
      kabupaten: "Gunungkidul",
      provinsi: "DI Yogyakarta",
      alamat: "Jl. Wonosari-Jogja Km 25",
      telepon: "0274-391234",
      email: "kopsarimurni@gmail.com",
      status: "aktif",
      tanggalBerdiri: "2021-06-01",
      catatan: null,
    },
    {
      nama: "Koperasi Desa Harapan Baru",
      noBadanHukum: "518/BH/KWK.52/II/2022",
      desa: "Harapan Baru",
      kecamatan: "Lamongan",
      kabupaten: "Lamongan",
      provinsi: "Jawa Timur",
      alamat: "Jl. Raya Lamongan-Babat No. 88",
      telepon: "0322-312456",
      email: "kopharapanbaru@gmail.com",
      status: "aktif",
      tanggalBerdiri: "2022-02-14",
      catatan: null,
    },
    {
      nama: "Koperasi Desa Makmur Sejahtera",
      noBadanHukum: "518/BH/KWK.61/V/2022",
      desa: "Makmur",
      kecamatan: "Pangkalan Bun",
      kabupaten: "Kotawaringin Barat",
      provinsi: "Kalimantan Tengah",
      alamat: "Jl. Pangkalan Bun Raya No. 3",
      telepon: "0532-21345",
      email: "kopmakmur@gmail.com",
      status: "pending",
      tanggalBerdiri: "2022-05-20",
      catatan: "Menunggu verifikasi dokumen",
    },
    {
      nama: "Koperasi Desa Bahari Mandiri",
      noBadanHukum: "518/BH/KWK.73/VIII/2023",
      desa: "Bahari",
      kecamatan: "Manokwari",
      kabupaten: "Manokwari",
      provinsi: "Papua Barat",
      alamat: "Jl. Pantai Indah No. 7",
      telepon: "0986-211234",
      email: "kopbahari@gmail.com",
      status: "pending",
      tanggalBerdiri: "2023-08-01",
      catatan: "Proses verifikasi awal",
    },
  ];

  const koperasiRows = await db.insert(koperasiTable).values(koperasiData).returning();
  const kop = koperasiRows[0]; // Koperasi Sukamaju — main koperasi
  console.log(`✅ ${koperasiRows.length} koperasi dibuat`);

  // ─── USERS ───────────────────────────────────────────────────────────────────
  const usersData = [
    // Demo accounts
    { username: "superadmin", passwordHash: PW, nama: "Dr. Bambang Susanto, M.Ec.", email: "superadmin@dinkop.go.id", telepon: "081234560001", role: "super_admin", koperasiId: null },
    { username: "pengurus1",  passwordHash: PW, nama: "Hj. Siti Rahayu, S.E.",       email: "pengurus@sukamaju.coop",  telepon: "081234560002", role: "pengurus",    koperasiId: kop.id },
    { username: "pengawas1",  passwordHash: PW, nama: "Drs. Ahmad Fauzi",            email: "pengawas@sukamaju.coop", telepon: "081234560003", role: "pengawas",    koperasiId: kop.id },
    { username: "anggota1",   passwordHash: PW, nama: "Budi Santoso",                email: "budi@gmail.com",         telepon: "081234560004", role: "anggota",     koperasiId: kop.id },
    { username: "operator1",  passwordHash: PW, nama: "Dewi Lestari",                email: "dewi@sukamaju.coop",     telepon: "081234560005", role: "operator_unit", koperasiId: kop.id },
    // Extra anggota users
    { username: "anggota2",   passwordHash: PW, nama: "Sari Dewi",                   email: "sari@gmail.com",         telepon: "081234560006", role: "anggota",     koperasiId: kop.id },
    { username: "anggota3",   passwordHash: PW, nama: "Joko Widodo Prasetyo",        email: "joko@gmail.com",         telepon: "081234560007", role: "anggota",     koperasiId: kop.id },
    { username: "anggota4",   passwordHash: PW, nama: "Rina Kusumawati",             email: "rina@gmail.com",         telepon: "081234560008", role: "anggota",     koperasiId: kop.id },
    { username: "anggota5",   passwordHash: PW, nama: "Agus Hermawan",               email: "agus@gmail.com",         telepon: "081234560009", role: "anggota",     koperasiId: kop.id },
    { username: "anggota6",   passwordHash: PW, nama: "Nur Hidayah",                 email: "nur@gmail.com",          telepon: "081234560010", role: "anggota",     koperasiId: kop.id },
    { username: "anggota7",   passwordHash: PW, nama: "Wawan Setiawan",              email: "wawan@gmail.com",        telepon: "081234560011", role: "anggota",     koperasiId: kop.id },
    { username: "anggota8",   passwordHash: PW, nama: "Fitri Handayani",             email: "fitri@gmail.com",        telepon: "081234560012", role: "anggota",     koperasiId: kop.id },
    { username: "anggota9",   passwordHash: PW, nama: "Hendra Gunawan",              email: "hendra@gmail.com",       telepon: "081234560013", role: "anggota",     koperasiId: kop.id },
    { username: "anggota10",  passwordHash: PW, nama: "Maya Sari Putri",             email: "maya@gmail.com",         telepon: "081234560014", role: "anggota",     koperasiId: kop.id },
    { username: "anggota11",  passwordHash: PW, nama: "Rizky Pratama",               email: "rizky@gmail.com",        telepon: "081234560015", role: "anggota",     koperasiId: kop.id },
    { username: "anggota12",  passwordHash: PW, nama: "Yuli Astuti",                 email: "yuli@gmail.com",         telepon: "081234560016", role: "anggota",     koperasiId: kop.id },
    { username: "anggota13",  passwordHash: PW, nama: "Dian Permatasari",            email: "dian@gmail.com",         telepon: "081234560017", role: "anggota",     koperasiId: kop.id },
    { username: "anggota14",  passwordHash: PW, nama: "Eko Prasetyo",                email: "eko@gmail.com",          telepon: "081234560018", role: "anggota",     koperasiId: kop.id },
    { username: "anggota15",  passwordHash: PW, nama: "Sri Wahyuni",                 email: "sri@gmail.com",          telepon: "081234560019", role: "anggota",     koperasiId: kop.id },
  ];

  const userRows = await db.insert(usersTable).values(usersData).returning();
  const uMap: Record<string, typeof userRows[0]> = {};
  for (const u of userRows) uMap[u.username] = u;
  console.log(`✅ ${userRows.length} users dibuat`);

  // ─── ANGGOTA ─────────────────────────────────────────────────────────────────
  const pekerjaan = ["Petani", "Pedagang", "Buruh", "Ibu Rumah Tangga", "Wiraswasta", "Nelayan", "Guru", "Sopir", "Tukang", "Karyawan"];
  const anggotaData = [
    { nomorAnggota: "SKM-2019-001", nama: "Budi Santoso",          nik: "3201011501870001", tempatLahir: "Bogor",    tanggalLahir: "1987-01-15", alamat: "Jl. Mawar No. 5, Sukamaju",    telepon: "081234560004", pekerjaan: "Petani",             koperasiId: kop.id, userId: uMap.anggota1.id,  status: "aktif" },
    { nomorAnggota: "SKM-2019-002", nama: "Sari Dewi",             nik: "3201012203920002", tempatLahir: "Bogor",    tanggalLahir: "1992-03-22", alamat: "Jl. Melati No. 8, Sukamaju",   telepon: "081234560006", pekerjaan: "Pedagang",           koperasiId: kop.id, userId: uMap.anggota2.id,  status: "aktif" },
    { nomorAnggota: "SKM-2019-003", nama: "Joko Widodo Prasetyo",  nik: "3201010507880003", tempatLahir: "Solo",     tanggalLahir: "1988-07-05", alamat: "Jl. Dahlia No. 3, Sukamaju",   telepon: "081234560007", pekerjaan: "Wiraswasta",         koperasiId: kop.id, userId: uMap.anggota3.id,  status: "aktif" },
    { nomorAnggota: "SKM-2020-004", nama: "Rina Kusumawati",       nik: "3201011209950004", tempatLahir: "Depok",    tanggalLahir: "1995-09-12", alamat: "Jl. Anggrek No. 12, Sukamaju", telepon: "081234560008", pekerjaan: "Ibu Rumah Tangga",   koperasiId: kop.id, userId: uMap.anggota4.id,  status: "aktif" },
    { nomorAnggota: "SKM-2020-005", nama: "Agus Hermawan",         nik: "3201010408850005", tempatLahir: "Bogor",    tanggalLahir: "1985-08-04", alamat: "Jl. Kenanga No. 7, Sukamaju",  telepon: "081234560009", pekerjaan: "Buruh",              koperasiId: kop.id, userId: uMap.anggota5.id,  status: "aktif" },
    { nomorAnggota: "SKM-2020-006", nama: "Nur Hidayah",           nik: "3201011810900006", tempatLahir: "Ciawi",    tanggalLahir: "1990-10-18", alamat: "Jl. Cempaka No. 4, Sukamaju",  telepon: "081234560010", pekerjaan: "Guru",               koperasiId: kop.id, userId: uMap.anggota6.id,  status: "aktif" },
    { nomorAnggota: "SKM-2020-007", nama: "Wawan Setiawan",        nik: "3201010302830007", tempatLahir: "Bogor",    tanggalLahir: "1983-02-03", alamat: "Jl. Flamboyan No. 9, Sukamaju", telepon: "081234560011", pekerjaan: "Sopir",             koperasiId: kop.id, userId: uMap.anggota7.id,  status: "aktif" },
    { nomorAnggota: "SKM-2021-008", nama: "Fitri Handayani",       nik: "3201011506980008", tempatLahir: "Tangerang", tanggalLahir: "1998-06-15", alamat: "Jl. Bougenville No. 2, Sukamaju", telepon: "081234560012", pekerjaan: "Karyawan",       koperasiId: kop.id, userId: uMap.anggota8.id,  status: "aktif" },
    { nomorAnggota: "SKM-2021-009", nama: "Hendra Gunawan",        nik: "3201012011870009", tempatLahir: "Bogor",    tanggalLahir: "1987-11-20", alamat: "Jl. Seruni No. 6, Sukamaju",   telepon: "081234560013", pekerjaan: "Pedagang",           koperasiId: kop.id, userId: uMap.anggota9.id,  status: "aktif" },
    { nomorAnggota: "SKM-2021-010", nama: "Maya Sari Putri",       nik: "3201010814940010", tempatLahir: "Bandung",  tanggalLahir: "1994-08-14", alamat: "Jl. Teratai No. 11, Sukamaju", telepon: "081234560014", pekerjaan: "Wiraswasta",         koperasiId: kop.id, userId: uMap.anggota10.id, status: "aktif" },
    { nomorAnggota: "SKM-2021-011", nama: "Rizky Pratama",         nik: "3201011705000011", tempatLahir: "Jakarta",  tanggalLahir: "2000-05-17", alamat: "Jl. Kamboja No. 14, Sukamaju", telepon: "081234560015", pekerjaan: "Karyawan",           koperasiId: kop.id, userId: uMap.anggota11.id, status: "aktif" },
    { nomorAnggota: "SKM-2022-012", nama: "Yuli Astuti",           nik: "3201012809860012", tempatLahir: "Sukabumi", tanggalLahir: "1986-09-28", alamat: "Jl. Lavender No. 16, Sukamaju", telepon: "081234560016", pekerjaan: "Petani",            koperasiId: kop.id, userId: uMap.anggota12.id, status: "aktif" },
    { nomorAnggota: "SKM-2022-013", nama: "Dian Permatasari",      nik: "3201011312910013", tempatLahir: "Bogor",    tanggalLahir: "1991-12-13", alamat: "Jl. Chrysant No. 18, Sukamaju", telepon: "081234560017", pekerjaan: "Ibu Rumah Tangga",  koperasiId: kop.id, userId: uMap.anggota13.id, status: "aktif" },
    { nomorAnggota: "SKM-2022-014", nama: "Eko Prasetyo",          nik: "3201010104890014", tempatLahir: "Bogor",    tanggalLahir: "1989-04-01", alamat: "Jl. Sakura No. 20, Sukamaju",  telepon: "081234560018", pekerjaan: "Tukang",             koperasiId: kop.id, userId: uMap.anggota14.id, status: "aktif" },
    { nomorAnggota: "SKM-2022-015", nama: "Sri Wahyuni",           nik: "3201010302930015", tempatLahir: "Bogor",    tanggalLahir: "1993-02-03", alamat: "Jl. Mawar Merah No. 1, Sukamaju", telepon: "081234560019", pekerjaan: "Pedagang",        koperasiId: kop.id, userId: uMap.anggota15.id, status: "aktif" },
    // Non-linked anggota
    { nomorAnggota: "SKM-2023-016", nama: "Sunarto",               nik: "3201011512780016", tempatLahir: "Bogor",    tanggalLahir: "1978-12-15", alamat: "Jl. Bangau No. 3, Sukamaju",   telepon: "08563001001",  pekerjaan: "Nelayan",            koperasiId: kop.id, userId: null, status: "aktif" },
    { nomorAnggota: "SKM-2023-017", nama: "Halimah Nuraini",       nik: "3201012508820017", tempatLahir: "Cianjur",  tanggalLahir: "1982-08-25", alamat: "Jl. Padi No. 7, Sukamaju",     telepon: "08563001002",  pekerjaan: "Petani",             koperasiId: kop.id, userId: null, status: "aktif" },
    { nomorAnggota: "SKM-2023-018", nama: "Tarmuji",               nik: "3201010305750018", tempatLahir: "Bogor",    tanggalLahir: "1975-05-03", alamat: "Jl. Jagung No. 9, Sukamaju",   telepon: "08563001003",  pekerjaan: "Petani",             koperasiId: kop.id, userId: null, status: "aktif" },
    { nomorAnggota: "SKM-2023-019", nama: "Lastri Wahyuningsih",   nik: "3201011907800019", tempatLahir: "Bogor",    tanggalLahir: "1980-07-19", alamat: "Jl. Kacang No. 11, Sukamaju",  telepon: "08563001004",  pekerjaan: "Pedagang",           koperasiId: kop.id, userId: null, status: "aktif" },
    { nomorAnggota: "SKM-2023-020", nama: "Dadang Setiabudi",      nik: "3201010210840020", tempatLahir: "Bogor",    tanggalLahir: "1984-10-02", alamat: "Jl. Singkong No. 13, Sukamaju", telepon: "08563001005", pekerjaan: "Wiraswasta",          koperasiId: kop.id, userId: null, status: "pending" },
  ];

  const anggotaRows = await db.insert(anggotaTable).values(anggotaData).returning();
  console.log(`✅ ${anggotaRows.length} anggota dibuat`);

  // Helper: find anggota by nomorAnggota
  const aIdx = (no: string) => anggotaRows.find(a => a.nomorAnggota === no)!;

  // ─── SIMPANAN ────────────────────────────────────────────────────────────────
  // For each anggota: simpanan pokok (1x), wajib (12 months), sukarela (random), penarikan (some)
  const simpananData: (typeof simpananTable.$inferInsert)[] = [];
  const opId = uMap.operator1.id;

  for (const ang of anggotaRows) {
    if (ang.status !== "aktif") continue;

    // Simpanan Pokok (once at joining)
    simpananData.push({
      anggotaId: ang.id,
      jenis: "pokok",
      jumlah: "100000",
      tanggal: dateStr(Math.floor(Math.random() * 400) + 200),
      keterangan: "Simpanan pokok awal keanggotaan",
      operatorId: opId,
    });

    // Simpanan Wajib (last 12 months)
    for (let m = 11; m >= 0; m--) {
      simpananData.push({
        anggotaId: ang.id,
        jenis: "wajib",
        jumlah: "50000",
        tanggal: monthStr(m, 5),
        keterangan: `Simpanan wajib bulan ke-${12 - m}`,
        operatorId: opId,
      });
    }

    // Simpanan Sukarela (random 1-4 kali)
    const nSukarela = Math.floor(Math.random() * 4) + 1;
    for (let s = 0; s < nSukarela; s++) {
      const amounts = ["200000", "300000", "500000", "750000", "1000000"];
      simpananData.push({
        anggotaId: ang.id,
        jenis: "sukarela",
        jumlah: amounts[Math.floor(Math.random() * amounts.length)],
        tanggal: dateStr(Math.floor(Math.random() * 200) + 10),
        keterangan: "Tabungan sukarela",
        operatorId: opId,
      });
    }
  }

  // Beberapa penarikan sukarela
  const activeAnggota = anggotaRows.filter(a => a.status === "aktif");
  for (let i = 0; i < 8; i++) {
    const ang = activeAnggota[i % activeAnggota.length];
    simpananData.push({
      anggotaId: ang.id,
      jenis: "penarikan",
      jumlah: String(-(Math.floor(Math.random() * 5) + 1) * 100000),
      tanggal: dateStr(Math.floor(Math.random() * 60) + 5),
      keterangan: "Penarikan simpanan sukarela",
      operatorId: opId,
    });
  }

  await db.insert(simpananTable).values(simpananData);
  console.log(`✅ ${simpananData.length} simpanan dibuat`);

  // ─── PINJAMAN + ANGSURAN ─────────────────────────────────────────────────────
  const pinjamanSeed: {
    anggotaId: number;
    jumlahPinjaman: string;
    tenorBulan: number;
    tujuan: string;
    status: string;
    tanggalPengajuan: string;
    tanggalDisetujui: string | null;
    tanggalJatuhTempo: string | null;
    catatanPengurus: string | null;
  }[] = [
    // aktif pinjaman
    { anggotaId: aIdx("SKM-2019-001").id, jumlahPinjaman: "5000000",  tenorBulan: 12, tujuan: "Modal usaha tani padi",           status: "aktif",   tanggalPengajuan: monthStr(10), tanggalDisetujui: monthStr(10, 7),  tanggalJatuhTempo: monthStr(-2, 7),  catatanPengurus: "Disetujui - rekam jejak baik" },
    { anggotaId: aIdx("SKM-2019-002").id, jumlahPinjaman: "10000000", tenorBulan: 24, tujuan: "Pengembangan usaha warung",        status: "aktif",   tanggalPengajuan: monthStr(8),  tanggalDisetujui: monthStr(8, 10),  tanggalJatuhTempo: monthStr(-16, 10), catatanPengurus: "Disetujui" },
    { anggotaId: aIdx("SKM-2019-003").id, jumlahPinjaman: "7500000",  tenorBulan: 12, tujuan: "Beli mesin jahit produksi",         status: "aktif",   tanggalPengajuan: monthStr(6),  tanggalDisetujui: monthStr(6, 5),   tanggalJatuhTempo: monthStr(-6, 5),  catatanPengurus: "Disetujui - usaha produktif" },
    { anggotaId: aIdx("SKM-2020-004").id, jumlahPinjaman: "3000000",  tenorBulan: 6,  tujuan: "Kebutuhan anak sekolah",           status: "aktif",   tanggalPengajuan: monthStr(4),  tanggalDisetujui: monthStr(4, 3),   tanggalJatuhTempo: monthStr(-2, 3),  catatanPengurus: null },
    { anggotaId: aIdx("SKM-2020-005").id, jumlahPinjaman: "15000000", tenorBulan: 36, tujuan: "Renovasi rumah",                   status: "aktif",   tanggalPengajuan: monthStr(12), tanggalDisetujui: monthStr(12, 15), tanggalJatuhTempo: monthStr(-24, 15), catatanPengurus: "Disetujui - jaminan tanah" },
    { anggotaId: aIdx("SKM-2020-006").id, jumlahPinjaman: "8000000",  tenorBulan: 12, tujuan: "Modal dagang sembako",             status: "aktif",   tanggalPengajuan: monthStr(5),  tanggalDisetujui: monthStr(5, 8),   tanggalJatuhTempo: monthStr(-7, 8),  catatanPengurus: null },
    // lunas
    { anggotaId: aIdx("SKM-2020-007").id, jumlahPinjaman: "4000000",  tenorBulan: 6,  tujuan: "Perbaikan kendaraan",              status: "lunas",   tanggalPengajuan: monthStr(20), tanggalDisetujui: monthStr(20, 10), tanggalJatuhTempo: monthStr(14, 10), catatanPengurus: "Disetujui" },
    { anggotaId: aIdx("SKM-2021-008").id, jumlahPinjaman: "2500000",  tenorBulan: 3,  tujuan: "Kebutuhan mendesak keluarga",      status: "lunas",   tanggalPengajuan: monthStr(18), tanggalDisetujui: monthStr(18, 5),  tanggalJatuhTempo: monthStr(15, 5),  catatanPengurus: null },
    { anggotaId: aIdx("SKM-2021-009").id, jumlahPinjaman: "6000000",  tenorBulan: 12, tujuan: "Modal usaha peternakan ayam",      status: "lunas",   tanggalPengajuan: monthStr(22), tanggalDisetujui: monthStr(22, 3),  tanggalJatuhTempo: monthStr(10, 3),  catatanPengurus: "Disetujui - usaha produktif" },
    { anggotaId: aIdx("SKM-2021-010").id, jumlahPinjaman: "5000000",  tenorBulan: 10, tujuan: "Pembelian peralatan dapur usaha",  status: "lunas",   tanggalPengajuan: monthStr(24), tanggalDisetujui: monthStr(24, 8),  tanggalJatuhTempo: monthStr(14, 8),  catatanPengurus: null },
    // pending
    { anggotaId: aIdx("SKM-2021-011").id, jumlahPinjaman: "9000000",  tenorBulan: 18, tujuan: "Modal usaha konveksi pakaian",     status: "pending", tanggalPengajuan: dateStr(3),   tanggalDisetujui: null,              tanggalJatuhTempo: null,             catatanPengurus: null },
    { anggotaId: aIdx("SKM-2022-012").id, jumlahPinjaman: "4500000",  tenorBulan: 9,  tujuan: "Biaya sekolah anak",               status: "pending", tanggalPengajuan: dateStr(1),   tanggalDisetujui: null,              tanggalJatuhTempo: null,             catatanPengurus: null },
    // ditolak
    { anggotaId: aIdx("SKM-2022-013").id, jumlahPinjaman: "20000000", tenorBulan: 36, tujuan: "Beli tanah pertanian",             status: "ditolak", tanggalPengajuan: monthStr(3),  tanggalDisetujui: null,              tanggalJatuhTempo: null,             catatanPengurus: "Ditolak - melebihi plafon anggota" },
    { anggotaId: aIdx("SKM-2022-014").id, jumlahPinjaman: "12000000", tenorBulan: 24, tujuan: "Renovasi toko",                    status: "aktif",   tanggalPengajuan: monthStr(7),  tanggalDisetujui: monthStr(7, 12),  tanggalJatuhTempo: monthStr(-17, 12), catatanPengurus: "Disetujui" },
    { anggotaId: aIdx("SKM-2022-015").id, jumlahPinjaman: "3500000",  tenorBulan: 6,  tujuan: "Modal dagang pasar",               status: "aktif",   tanggalPengajuan: monthStr(2),  tanggalDisetujui: monthStr(2, 20),  tanggalJatuhTempo: monthStr(-4, 20), catatanPengurus: null },
  ];

  const bungaPersen = 1.5;

  const pinjamanRows = await db.insert(pinjamanTable).values(
    pinjamanSeed.map(p => ({
      ...p,
      bungaPersen: String(bungaPersen),
      angsuranPerBulan: String(
        Math.round((Number(p.jumlahPinjaman) * (1 + (bungaPersen / 100) * p.tenorBulan)) / p.tenorBulan)
      ),
    }))
  ).returning();
  console.log(`✅ ${pinjamanRows.length} pinjaman dibuat`);

  // Angsuran for each pinjaman
  const angsuranData: (typeof angsuranTable.$inferInsert)[] = [];

  for (let pi = 0; pi < pinjamanRows.length; pi++) {
    const p = pinjamanRows[pi];
    const seed = pinjamanSeed[pi];
    const angsuranPerBulan = Number(p.angsuranPerBulan);
    const startDate = seed.tanggalDisetujui
      ? new Date(seed.tanggalDisetujui)
      : new Date(seed.tanggalPengajuan);

    for (let k = 1; k <= p.tenorBulan; k++) {
      const jatuhTempo = new Date(startDate);
      jatuhTempo.setMonth(jatuhTempo.getMonth() + k);
      const jtStr = jatuhTempo.toISOString().split("T")[0];
      const sudahLewat = jatuhTempo < new Date();

      let status = "belum_bayar";
      let tanggalBayar: string | null = null;
      let jumlahDibayar: string | null = null;

      if (seed.status === "lunas") {
        status = "lunas";
        tanggalBayar = jtStr;
        jumlahDibayar = String(angsuranPerBulan);
      } else if (seed.status === "aktif" && sudahLewat) {
        // Paid installments that are past
        const today = new Date();
        const monthsActive = Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        if (k <= monthsActive) {
          status = "lunas";
          tanggalBayar = jtStr;
          jumlahDibayar = String(angsuranPerBulan);
        }
      }

      angsuranData.push({
        pinjamanId: p.id,
        periodeKe: k,
        jumlahAngsuran: String(angsuranPerBulan),
        jumlahDibayar,
        tanggalJatuhTempo: jtStr,
        tanggalBayar,
        status,
      });
    }
  }

  await db.insert(angsuranTable).values(angsuranData);
  console.log(`✅ ${angsuranData.length} angsuran dibuat`);

  // ─── UNIT USAHA ──────────────────────────────────────────────────────────────
  const unitUsahaData = [
    { koperasiId: kop.id, nama: "Toko Sembako Koperasi", jenis: "retail",        deskripsi: "Toko kebutuhan pokok masyarakat desa Sukamaju — beras, minyak, gula, dll.", aktif: true },
    { koperasiId: kop.id, nama: "Unit Simpan Pinjam",   jenis: "simpan_pinjam",  deskripsi: "Layanan simpan pinjam anggota koperasi dengan bunga ringan 1.5%/bulan.",     aktif: true },
    { koperasiId: kop.id, nama: "Warung Makan Koperasi", jenis: "kuliner",        deskripsi: "Warung makan sehat dan terjangkau untuk warga desa — masakan rumahan khas Sunda.", aktif: true },
    { koperasiId: kop.id, nama: "Kios Pupuk & Bibit",   jenis: "pertanian",      deskripsi: "Penyediaan pupuk, bibit, dan pestisida bersubsidi untuk petani anggota.",    aktif: false },
  ];

  const unitUsahaRows = await db.insert(unitUsahaTable).values(unitUsahaData).returning();
  const uuToko   = unitUsahaRows[0];
  const uuWarung = unitUsahaRows[2];
  const uuKios   = unitUsahaRows[3];
  console.log(`✅ ${unitUsahaRows.length} unit usaha dibuat`);

  // ─── PRODUK ──────────────────────────────────────────────────────────────────
  const produkData: (typeof produkTable.$inferInsert)[] = [
    // Toko Sembako
    { unitUsahaId: uuToko.id, nama: "Beras Premium 5kg",        kategori: "Bahan Pokok",   hargaBeli: "65000",  hargaJual: "72000",  stok: "150",  satuan: "karung" },
    { unitUsahaId: uuToko.id, nama: "Beras Medium 5kg",         kategori: "Bahan Pokok",   hargaBeli: "52000",  hargaJual: "58000",  stok: "200",  satuan: "karung" },
    { unitUsahaId: uuToko.id, nama: "Minyak Goreng 1L",         kategori: "Bahan Pokok",   hargaBeli: "14000",  hargaJual: "16000",  stok: "300",  satuan: "botol" },
    { unitUsahaId: uuToko.id, nama: "Gula Pasir 1kg",           kategori: "Bahan Pokok",   hargaBeli: "13500",  hargaJual: "15000",  stok: "250",  satuan: "kg" },
    { unitUsahaId: uuToko.id, nama: "Tepung Terigu 1kg",        kategori: "Bahan Pokok",   hargaBeli: "9000",   hargaJual: "10500",  stok: "180",  satuan: "bungkus" },
    { unitUsahaId: uuToko.id, nama: "Telur Ayam 1kg",           kategori: "Protein",       hargaBeli: "27000",  hargaJual: "30000",  stok: "80",   satuan: "kg" },
    { unitUsahaId: uuToko.id, nama: "Indomie Goreng (dus 40)",  kategori: "Mie Instan",    hargaBeli: "92000",  hargaJual: "105000", stok: "50",   satuan: "dus" },
    { unitUsahaId: uuToko.id, nama: "Kecap Manis 600ml",        kategori: "Bumbu",         hargaBeli: "12000",  hargaJual: "14500",  stok: "120",  satuan: "botol" },
    { unitUsahaId: uuToko.id, nama: "Sabun Mandi Batang",       kategori: "Kebersihan",    hargaBeli: "3500",   hargaJual: "4500",   stok: "400",  satuan: "buah" },
    { unitUsahaId: uuToko.id, nama: "Detergen 800g",            kategori: "Kebersihan",    hargaBeli: "18000",  hargaJual: "21000",  stok: "90",   satuan: "bungkus" },
    { unitUsahaId: uuToko.id, nama: "Gas LPG 3kg",              kategori: "Energi",        hargaBeli: "18000",  hargaJual: "21000",  stok: "60",   satuan: "tabung" },
    { unitUsahaId: uuToko.id, nama: "Susu Kental Manis 385g",   kategori: "Minuman",       hargaBeli: "11000",  hargaJual: "13000",  stok: "7",    satuan: "kaleng" },
    // Warung Makan
    { unitUsahaId: uuWarung.id, nama: "Nasi Uduk Komplit",       kategori: "Makanan",       hargaBeli: "8000",   hargaJual: "12000",  stok: "999",  satuan: "porsi" },
    { unitUsahaId: uuWarung.id, nama: "Nasi Rames Ayam",         kategori: "Makanan",       hargaBeli: "10000",  hargaJual: "15000",  stok: "999",  satuan: "porsi" },
    { unitUsahaId: uuWarung.id, nama: "Nasi Sayur Lodeh",        kategori: "Makanan",       hargaBeli: "7000",   hargaJual: "10000",  stok: "999",  satuan: "porsi" },
    { unitUsahaId: uuWarung.id, nama: "Es Teh Manis",            kategori: "Minuman",       hargaBeli: "1500",   hargaJual: "4000",   stok: "999",  satuan: "gelas" },
    { unitUsahaId: uuWarung.id, nama: "Kopi Hitam",              kategori: "Minuman",       hargaBeli: "2000",   hargaJual: "5000",   stok: "999",  satuan: "gelas" },
    { unitUsahaId: uuWarung.id, nama: "Gorengan (5 pcs)",        kategori: "Snack",         hargaBeli: "3000",   hargaJual: "5000",   stok: "999",  satuan: "porsi" },
    // Kios Pupuk
    { unitUsahaId: uuKios.id, nama: "Pupuk Urea 50kg",           kategori: "Pupuk",         hargaBeli: "112000", hargaJual: "125000", stok: "200",  satuan: "karung" },
    { unitUsahaId: uuKios.id, nama: "Bibit Padi IR64",           kategori: "Bibit",         hargaBeli: "60000",  hargaJual: "70000",  stok: "150",  satuan: "kg" },
    { unitUsahaId: uuKios.id, nama: "Pestisida Serbaguna 500ml", kategori: "Pestisida",     hargaBeli: "35000",  hargaJual: "45000",  stok: "80",   satuan: "botol" },
  ];

  const produkRows = await db.insert(produkTable).values(produkData).returning();
  console.log(`✅ ${produkRows.length} produk dibuat`);

  const tokoProduks   = produkRows.filter(p => p.unitUsahaId === uuToko.id);
  const warungProduks = produkRows.filter(p => p.unitUsahaId === uuWarung.id);

  // ─── TRANSAKSI POS ───────────────────────────────────────────────────────────
  const transaksiData: (typeof transaksiTable.$inferInsert)[] = [];

  function makeTxItems(prods: typeof produkRows, count: number) {
    const items = [];
    const shuffled = [...prods].sort(() => Math.random() - 0.5).slice(0, count);
    let total = 0;
    for (const prod of shuffled) {
      const qty = Math.floor(Math.random() * 3) + 1;
      const subtotal = Number(prod.hargaJual) * qty;
      total += subtotal;
      items.push({ produkId: prod.id, nama: prod.nama, qty, harga: Number(prod.hargaJual), subtotal });
    }
    return { items, total };
  }

  // Generate 60 transaksi over last 90 days
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const isWarung = Math.random() < 0.3;
    const prods = isWarung ? warungProduks : tokoProduks;
    const unitId = isWarung ? uuWarung.id : uuToko.id;
    const count = Math.floor(Math.random() * 3) + 1;
    const { items, total } = makeTxItems(prods, count);
    const ang = activeAnggota[Math.floor(Math.random() * activeAnggota.length)];

    transaksiData.push({
      unitUsahaId: unitId,
      anggotaId: Math.random() < 0.7 ? ang.id : null,
      operatorId: uMap.operator1.id,
      totalHarga: String(total),
      tanggal: dateStr(daysAgo),
      keterangan: isWarung ? "Pembelian di warung makan koperasi" : "Pembelian di toko sembako koperasi",
      items: JSON.stringify(items),
    });
  }

  await db.insert(transaksiTable).values(transaksiData);
  console.log(`✅ ${transaksiData.length} transaksi dibuat`);

  // ─── AKTIVITAS LOG ───────────────────────────────────────────────────────────
  const logEntries = [
    { userId: uMap.pengurus1.id, aksi: "CREATE",  tabel: "anggota",       detail: "Mendaftarkan anggota baru: Dadang Setiabudi (SKM-2023-020)" },
    { userId: uMap.pengurus1.id, aksi: "UPDATE",  tabel: "pinjaman",      detail: "Menyetujui pengajuan pinjaman Rizky Pratama Rp 9.000.000" },
    { userId: uMap.operator1.id, aksi: "CREATE",  tabel: "simpanan",      detail: "Menerima simpanan wajib bulan ini - 15 anggota" },
    { userId: uMap.operator1.id, aksi: "CREATE",  tabel: "transaksi",     detail: "Transaksi POS Toko Sembako — total Rp 285.000" },
    { userId: uMap.pengurus1.id, aksi: "UPDATE",  tabel: "koperasi",      detail: "Memperbarui profil koperasi — nomor telepon & email" },
    { userId: uMap.operator1.id, aksi: "CREATE",  tabel: "angsuran",      detail: "Menerima angsuran pinjaman Budi Santoso periode ke-5" },
    { userId: uMap.pengurus1.id, aksi: "CREATE",  tabel: "pinjaman",      detail: "Pengajuan pinjaman baru diproses: Yuli Astuti Rp 4.500.000" },
    { userId: uMap.operator1.id, aksi: "UPDATE",  tabel: "produk",        detail: "Update stok beras premium — 150 karung" },
    { userId: uMap.pengurus1.id, aksi: "UPDATE",  tabel: "pinjaman",      detail: "Menolak pengajuan pinjaman Dian Permatasari — melebihi plafon" },
    { userId: uMap.operator1.id, aksi: "CREATE",  tabel: "transaksi",     detail: "Transaksi POS Warung Makan — total Rp 95.000" },
    { userId: uMap.pengawas1.id, aksi: "READ",    tabel: "aktivitas_log", detail: "Mengakses laporan log aktivitas bulanan" },
    { userId: uMap.pengawas1.id, aksi: "READ",    tabel: "keuangan",      detail: "Memeriksa laporan keuangan bulan lalu" },
    { userId: uMap.operator1.id, aksi: "CREATE",  tabel: "simpanan",      detail: "Menerima simpanan sukarela: Sari Dewi Rp 500.000" },
    { userId: uMap.pengurus1.id, aksi: "UPDATE",  tabel: "anggota",       detail: "Mengaktifkan anggota baru: Sunarto (SKM-2023-016)" },
    { userId: uMap.operator1.id, aksi: "CREATE",  tabel: "transaksi",     detail: "Transaksi POS Toko Sembako — total Rp 412.000" },
    { userId: uMap.pengurus1.id, aksi: "CREATE",  tabel: "unit_usaha",    detail: "Menambahkan unit usaha baru: Kios Pupuk & Bibit" },
    { userId: uMap.operator1.id, aksi: "UPDATE",  tabel: "produk",        detail: "Update harga minyak goreng menjadi Rp 16.000" },
    { userId: uMap.pengawas1.id, aksi: "READ",    tabel: "audit",         detail: "Melakukan audit triwulan kesehatan koperasi" },
    { userId: uMap.pengurus1.id, aksi: "UPDATE",  tabel: "anggota",       detail: "Memperbarui data anggota: Agus Hermawan — nomor telepon" },
    { userId: uMap.operator1.id, aksi: "CREATE",  tabel: "angsuran",      detail: "Menerima angsuran pinjaman Nur Hidayah periode ke-3" },
    { userId: uMap.superadmin.id, aksi: "UPDATE", tabel: "koperasi",      detail: "Memverifikasi Koperasi Desa Sukamaju — status aktif" },
    { userId: uMap.superadmin.id, aksi: "CREATE", tabel: "koperasi",      detail: "Mendaftarkan koperasi baru: Koperasi Desa Bahari Mandiri" },
    { userId: uMap.pengurus1.id, aksi: "CREATE",  tabel: "simpanan",      detail: "Catat simpanan pokok anggota baru: Dadang Setiabudi" },
    { userId: uMap.operator1.id, aksi: "UPDATE",  tabel: "produk",        detail: "Tambah stok telur ayam 50kg" },
    { userId: uMap.pengurus1.id, aksi: "READ",    tabel: "laporan",       detail: "Mencetak laporan SHU tahun berjalan" },
  ];

  const logRows = logEntries.map((e, i) => ({
    ...e,
    referensiId: i + 1,
  }));

  await db.insert(aktivitasLogTable).values(logRows);
  console.log(`✅ ${logRows.length} aktivitas log dibuat`);

  // ─── SUMMARY ─────────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed selesai! Ringkasan data:");
  console.log(`   - Koperasi     : ${koperasiRows.length}`);
  console.log(`   - Users        : ${userRows.length}`);
  console.log(`   - Anggota      : ${anggotaRows.length}`);
  console.log(`   - Simpanan     : ${simpananData.length}`);
  console.log(`   - Pinjaman     : ${pinjamanRows.length}`);
  console.log(`   - Angsuran     : ${angsuranData.length}`);
  console.log(`   - Unit Usaha   : ${unitUsahaRows.length}`);
  console.log(`   - Produk       : ${produkRows.length}`);
  console.log(`   - Transaksi    : ${transaksiData.length}`);
  console.log(`   - Aktivitas Log: ${logRows.length}`);

  await pool.end();
}

main().catch(err => {
  console.error("❌ Seed gagal:", err);
  process.exit(1);
});
