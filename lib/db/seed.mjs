import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? undefined : { rejectUnauthorized: false },
});

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'koperasi_salt').digest('hex');
}

function dateStr(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function monthAgo(months, day = 1) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setDate(day);
  return d.toISOString().split('T')[0];
}

function rand(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear all tables
    await client.query(`
      TRUNCATE TABLE aktivitas_log, transaksi, angsuran, pinjaman, simpanan,
        produk, unit_usaha, anggota, users, koperasi RESTART IDENTITY CASCADE
    `);

    const pwHash = hashPassword('password123');

    // ── Koperasi ─────────────────────────────────────────────────────────────
    const [kop1] = (await client.query(`
      INSERT INTO koperasi (nama, no_badan_hukum, desa, kecamatan, kabupaten, provinsi,
        alamat, telepon, email, status, tanggal_berdiri)
      VALUES
        ('Koperasi Merah Putih Sukamaju','BH-123/KOP/2020','Sukamaju','Ciawi','Bogor',
         'Jawa Barat','Jl. Raya Sukamaju No. 1, Desa Sukamaju, Kec. Ciawi, Bogor',
         '0251-8123456','kop.sukamaju@email.com','aktif','2020-03-15')
      RETURNING id
    `)).rows;

    const koperasiId = kop1.id;

    await client.query(`
      INSERT INTO koperasi (nama, no_badan_hukum, desa, kecamatan, kabupaten, provinsi, status, tanggal_berdiri)
      VALUES
        ('Koperasi Sejahtera Mandiri','BH-456/KOP/2021','Cileungsi','Cileungsi','Bogor','Jawa Barat','aktif','2021-06-01'),
        ('Koperasi Karya Bersama','BH-789/KOP/2019','Parung','Parung','Bogor','Jawa Barat','aktif','2019-09-17'),
        ('Koperasi Harapan Bangsa','BH-321/KOP/2022','Jonggol','Jonggol','Bogor','Jawa Barat','aktif','2022-04-20'),
        ('Koperasi Tunas Muda',NULL,'Gunung Putri','Gunung Putri','Bogor','Jawa Barat','pending','2024-01-10'),
        ('Koperasi Tani Makmur','BH-654/KOP/2018','Dramaga','Dramaga','Bogor','Jawa Barat','aktif','2018-11-05'),
        ('Koperasi Nelayan Jaya','BH-987/KOP/2023','Muara Gembong','Muara Gembong','Bekasi','Jawa Barat','aktif','2023-03-22')
    `);

    // ── Users ─────────────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO users (username, password_hash, nama, email, role, koperasi_id, aktif)
      VALUES ('superadmin',$1,'Administrator Dinas','superadmin@dinas.go.id','super_admin',NULL,true)
    `, [pwHash]);

    const [pengurusRow] = (await client.query(`
      INSERT INTO users (username, password_hash, nama, email, telepon, role, koperasi_id, aktif)
      VALUES ('pengurus1',$1,'Budi Santoso','budi@kopsukamaju.com','081234567890','pengurus',$2,true)
      RETURNING id
    `, [pwHash, koperasiId])).rows;
    const pengurusUserId = pengurusRow.id;

    await client.query(`
      INSERT INTO users (username, password_hash, nama, email, role, koperasi_id, aktif)
      VALUES ('pengawas1',$1,'Siti Rahayu','siti@kopsukamaju.com','pengawas',$2,true)
    `, [pwHash, koperasiId]);

    const [operatorRow] = (await client.query(`
      INSERT INTO users (username, password_hash, nama, email, role, koperasi_id, aktif)
      VALUES ('operator1',$1,'Ahmad Fauzi','ahmad@kopsukamaju.com','operator_unit',$2,true)
      RETURNING id
    `, [pwHash, koperasiId])).rows;
    const operatorUserId = operatorRow.id;

    // Anggota users
    const anggotaUserData = [
      ['anggota1','Andi Wijaya','andi@email.com','081111111111'],
      ['anggota2','Dewi Sartika','dewi@email.com','081222222222'],
      ['anggota3','Rudi Hartono','rudi@email.com','081333333333'],
      ['anggota4','Nina Kusuma','nina@email.com','081444444444'],
      ['anggota5','Hendra Gunawan','hendra@email.com','081555555555'],
      ['anggota6','Ratna Wulandari','ratna@email.com','081666666666'],
      ['anggota7','Dedi Supriadi','dedi@email.com','081777777777'],
      ['anggota8','Yanti Kartika','yanti@email.com','081888888888'],
    ];

    const anggotaUserIds = [];
    for (const [uname, nama, email, tlp] of anggotaUserData) {
      const [row] = (await client.query(`
        INSERT INTO users (username, password_hash, nama, email, telepon, role, koperasi_id, aktif)
        VALUES ($1,$2,$3,$4,$5,'anggota',$6,true) RETURNING id
      `, [uname, pwHash, nama, email, tlp, koperasiId])).rows;
      anggotaUserIds.push(row.id);
    }

    // ── Anggota ───────────────────────────────────────────────────────────────
    const anggotaInfo = [
      ['Andi Wijaya','3201010101800001','Bogor','1980-01-15','Jl. Merdeka No. 1, Sukamaju','Petani'],
      ['Dewi Sartika','3201010201850002','Sukabumi','1985-02-20','Jl. Sudirman No. 5, Sukamaju','Pedagang'],
      ['Rudi Hartono','3201010301820003','Bandung','1982-03-10','Jl. Gatot Subroto No. 12, Sukamaju','Guru'],
      ['Nina Kusuma','3201010401900004','Jakarta','1990-04-25','Jl. Pahlawan No. 7, Sukamaju','Wiraswasta'],
      ['Hendra Gunawan','3201010501780005','Bogor','1978-05-05','Jl. Proklamasi No. 3, Sukamaju','Petani'],
      ['Ratna Wulandari','3201010601880006','Cianjur','1988-06-30','Jl. Diponegoro No. 9, Sukamaju','Ibu Rumah Tangga'],
      ['Dedi Supriadi','3201010701830007','Bekasi','1983-07-14','Jl. Ahmad Yani No. 4, Sukamaju','Buruh'],
      ['Yanti Kartika','3201010801920008','Depok','1992-08-22','Jl. Kartini No. 6, Sukamaju','PNS'],
    ];

    const anggotaIds = [];
    for (let i = 0; i < anggotaInfo.length; i++) {
      const [nama, nik, tempat, lahir, alamat, pekerjaan] = anggotaInfo[i];
      const [row] = (await client.query(`
        INSERT INTO anggota (nomor_anggota, nama, nik, tempat_lahir, tanggal_lahir, alamat, telepon, pekerjaan, koperasi_id, user_id, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'aktif') RETURNING id
      `, [
        `KMP-${String(i+1).padStart(4,'0')}`,
        nama, nik, tempat, lahir, alamat,
        anggotaUserData[i][3],
        pekerjaan, koperasiId, anggotaUserIds[i]
      ])).rows;
      anggotaIds.push(row.id);
    }

    // ── Simpanan ──────────────────────────────────────────────────────────────
    for (const anggotaId of anggotaIds) {
      // Simpanan pokok (once)
      await client.query(`
        INSERT INTO simpanan (anggota_id, jenis, jumlah, tanggal, keterangan, operator_id)
        VALUES ($1,'pokok','500000',$2,'Simpanan pokok pendaftaran anggota',$3)
      `, [anggotaId, dateStr(rand(300,400)), operatorUserId]);

      // Simpanan wajib (13 months)
      for (let m = 13; m >= 0; m--) {
        const jumlah = [100000,150000,200000][rand(0,2)];
        await client.query(`
          INSERT INTO simpanan (anggota_id, jenis, jumlah, tanggal, keterangan, operator_id)
          VALUES ($1,'wajib',$2,$3,$4,$5)
        `, [anggotaId, String(jumlah), monthAgo(m, 1), `Simpanan wajib bulan ke-${14-m}`, operatorUserId]);
      }

      // Simpanan sukarela (50% chance, 1-3 deposits)
      if (Math.random() > 0.4) {
        const count = rand(1, 3);
        for (let k = 0; k < count; k++) {
          await client.query(`
            INSERT INTO simpanan (anggota_id, jenis, jumlah, tanggal, keterangan, operator_id)
            VALUES ($1,'sukarela',$2,$3,'Tabungan sukarela',$4)
          `, [anggotaId, String(rand(200000, 1000000)), monthAgo(rand(0,12), rand(1,28)), operatorUserId]);
        }
      }
    }

    // ── Pinjaman ──────────────────────────────────────────────────────────────
    const pinjamanDefs = [
      { idx: 0, jumlah: 5000000, tenor: 12, tujuan: 'Modal usaha warung sembako', status: 'aktif', bulanLalu: 7 },
      { idx: 1, jumlah: 3000000, tenor: 6,  tujuan: 'Renovasi rumah',             status: 'aktif', bulanLalu: 3 },
      { idx: 2, jumlah: 10000000, tenor: 24, tujuan: 'Pembelian peralatan pertanian', status: 'aktif', bulanLalu: 11 },
      { idx: 3, jumlah: 2000000, tenor: 6,  tujuan: 'Biaya pendidikan anak',       status: 'lunas', bulanLalu: 13 },
      { idx: 4, jumlah: 7500000, tenor: 18, tujuan: 'Modal usaha ternak ayam',     status: 'aktif', bulanLalu: 5 },
      { idx: 5, jumlah: 1500000, tenor: 3,  tujuan: 'Kebutuhan mendesak keluarga', status: 'pending', bulanLalu: 0 },
      { idx: 6, jumlah: 8000000, tenor: 24, tujuan: 'Modal toko kelontong',        status: 'macet', bulanLalu: 20 },
      { idx: 7, jumlah: 4000000, tenor: 12, tujuan: 'Pembelian kendaraan usaha',   status: 'aktif', bulanLalu: 2 },
    ];

    for (const p of pinjamanDefs) {
      const bunga = 1.5;
      const angsuranPerBulan = Math.round((p.jumlah * (1 + (bunga / 100) * (p.tenor / 12))) / p.tenor);
      const tglPengajuan = dateStr(p.bulanLalu * 30 + 5);
      const isApproved = p.status !== 'pending' && p.status !== 'ditolak';
      const tglDisetujui = isApproved ? dateStr(p.bulanLalu * 30) : null;
      const tglJatuhTempo = tglDisetujui
        ? (() => { const d = new Date(tglDisetujui); d.setMonth(d.getMonth() + p.tenor); return d.toISOString().split('T')[0]; })()
        : null;

      const [pinjamanRow] = (await client.query(`
        INSERT INTO pinjaman (anggota_id, jumlah_pinjaman, bunga_persen, tenor_bulan, angsuran_per_bulan,
          tujuan, status, tanggal_pengajuan, tanggal_disetujui, tanggal_jatuh_tempo, catatan_pengurus)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id
      `, [
        anggotaIds[p.idx], String(p.jumlah), String(bunga), p.tenor, String(angsuranPerBulan),
        p.tujuan, p.status, tglPengajuan, tglDisetujui, tglJatuhTempo,
        isApproved ? 'Disetujui oleh pengurus' : (p.status === 'pending' ? null : 'Tidak memenuhi syarat'),
      ])).rows;

      if (!isApproved) continue;

      // Create angsuran schedule
      const bulanSudahBayar = p.status === 'lunas'
        ? p.tenor
        : (p.status === 'macet' ? Math.floor(p.tenor * 0.25) : Math.min(p.bulanLalu, p.tenor - 1));

      for (let i = 1; i <= p.tenor; i++) {
        const tglAngsuran = (() => {
          const d = new Date(tglDisetujui);
          d.setMonth(d.getMonth() + i);
          return d.toISOString().split('T')[0];
        })();
        const sudahLunas = i <= bulanSudahBayar;
        const tglBayar = sudahLunas
          ? (() => { const d = new Date(tglAngsuran); d.setDate(d.getDate() - rand(1, 5)); return d.toISOString().split('T')[0]; })()
          : null;

        await client.query(`
          INSERT INTO angsuran (pinjaman_id, periode_ke, jumlah_angsuran, jumlah_dibayar,
            tanggal_jatuh_tempo, tanggal_bayar, status)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
        `, [
          pinjamanRow.id, i, String(angsuranPerBulan),
          sudahLunas ? String(angsuranPerBulan) : null,
          tglAngsuran, tglBayar,
          sudahLunas ? 'lunas' : 'belum_bayar',
        ]);
      }
    }

    // ── Unit Usaha ────────────────────────────────────────────────────────────
    const [unitRow1] = (await client.query(`
      INSERT INTO unit_usaha (koperasi_id, nama, jenis, deskripsi, aktif)
      VALUES ($1,'Warung Sembako Merah Putih','warung',
        'Warung kebutuhan pokok dan sembako untuk anggota dan masyarakat umum',true)
      RETURNING id
    `, [koperasiId])).rows;
    const unitId1 = unitRow1.id;

    const [unitRow2] = (await client.query(`
      INSERT INTO unit_usaha (koperasi_id, nama, jenis, deskripsi, aktif)
      VALUES ($1,'Unit Pertanian & Pupuk','pertanian',
        'Penyediaan pupuk, bibit, dan kebutuhan pertanian untuk petani anggota koperasi',true)
      RETURNING id
    `, [koperasiId])).rows;
    const unitId2 = unitRow2.id;

    await client.query(`
      INSERT INTO unit_usaha (koperasi_id, nama, jenis, deskripsi, aktif)
      VALUES ($1,'Jasa Simpan Pinjam','jasa',
        'Layanan simpan pinjam uang bagi anggota koperasi dengan bunga ringan',true)
    `, [koperasiId]);

    // ── Produk Unit 1 (Warung Sembako) ────────────────────────────────────────
    const produkUnit1 = [
      ['Beras Premium 5kg','bahan_pokok','55000','68000','150','kg'],
      ['Minyak Goreng 1L','bahan_pokok','14000','18000','200','botol'],
      ['Gula Pasir 1kg','bahan_pokok','14000','17000','180','kg'],
      ['Telur Ayam 1kg','bahan_pokok','26000','32000','80','kg'],
      ['Tepung Terigu 1kg','bahan_pokok','9000','13000','120','kg'],
      ['Indomie Goreng','mie_instan','2800','3500','500','bungkus'],
      ['Sabun Mandi Batang','kebersihan','3500','5000','200','buah'],
      ['Shampo Sachet','kebersihan','1200','2000','300','sachet'],
      ['Detergen 1kg','kebersihan','18000','25000','3','kg'],
      ['Rokok Gudang Garam','rokok','18500','23000','4','bungkus'],
      ['Kopi Kapal Api 165g','minuman','19000','25000','60','bungkus'],
      ['Teh Kotak 200ml','minuman','4500','7000','120','kotak'],
      ['Garam Dapur 500g','bumbu','3000','5000','80','bungkus'],
      ['Kecap Manis 220ml','bumbu','11000','15000','50','botol'],
    ];

    const produkData1 = [];
    for (const [nama, kat, hb, hj, stok, satuan] of produkUnit1) {
      const [row] = (await client.query(`
        INSERT INTO produk (unit_usaha_id, nama, kategori, harga_beli, harga_jual, stok, satuan)
        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id
      `, [unitId1, nama, kat, hb, hj, stok, satuan])).rows;
      produkData1.push({ id: row.id, hargaJual: Number(hj) });
    }

    // ── Produk Unit 2 (Pertanian) ─────────────────────────────────────────────
    const produkUnit2 = [
      ['Pupuk Urea 50kg','pupuk','115000','140000','80','karung'],
      ['Pupuk NPK 50kg','pupuk','130000','160000','60','karung'],
      ['Pupuk Kandang 25kg','pupuk','25000','35000','100','karung'],
      ['Bibit Padi IR64 5kg','bibit','45000','60000','40','kg'],
      ['Bibit Jagung Manis 250g','bibit','35000','50000','30','bungkus'],
      ['Pestisida Roundup 1L','pestisida','55000','75000','2','botol'],
      ['Fungisida Dithane 1kg','pestisida','65000','85000','25','kg'],
      ['Cangkul Gagang Kayu','alat','85000','110000','15','buah'],
      ['Sprayer Manual 16L','alat','175000','220000','8','unit'],
      ['Selang Irigasi 50m','alat','120000','155000','10','roll'],
    ];

    const produkData2 = [];
    for (const [nama, kat, hb, hj, stok, satuan] of produkUnit2) {
      const [row] = (await client.query(`
        INSERT INTO produk (unit_usaha_id, nama, kategori, harga_beli, harga_jual, stok, satuan)
        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id
      `, [unitId2, nama, kat, hb, hj, stok, satuan])).rows;
      produkData2.push({ id: row.id, hargaJual: Number(hj) });
    }

    // ── Transaksi (6 bulan terakhir) ──────────────────────────────────────────
    for (let m = 6; m >= 0; m--) {
      const jumlahTrx = rand(10, 20);
      for (let t = 0; t < jumlahTrx; t++) {
        const day = rand(1, 27);
        const tgl = (() => { const d = new Date(); d.setMonth(d.getMonth() - m); d.setDate(day); return d.toISOString().split('T')[0]; })();
        const numItems = rand(2, 4);
        const picked = [...produkData1].sort(() => Math.random() - 0.5).slice(0, numItems);
        const items = picked.map(p => ({ produkId: p.id, qty: rand(1, 5), hargaSatuan: p.hargaJual }));
        const total = items.reduce((s, i) => s + i.qty * i.hargaSatuan, 0);
        const aId = Math.random() > 0.35 ? anggotaIds[rand(0, anggotaIds.length - 1)] : null;

        await client.query(`
          INSERT INTO transaksi (unit_usaha_id, anggota_id, operator_id, total_harga, tanggal, keterangan, items)
          VALUES ($1,$2,$3,$4,$5,'Transaksi POS warung',$6)
        `, [unitId1, aId, operatorUserId, String(total), tgl, JSON.stringify(items)]);
      }

      // Unit 2 transactions
      const jumlahTrx2 = rand(4, 10);
      for (let t = 0; t < jumlahTrx2; t++) {
        const day = rand(1, 27);
        const tgl = (() => { const d = new Date(); d.setMonth(d.getMonth() - m); d.setDate(day); return d.toISOString().split('T')[0]; })();
        const numItems = rand(1, 3);
        const picked = [...produkData2].sort(() => Math.random() - 0.5).slice(0, numItems);
        const items = picked.map(p => ({ produkId: p.id, qty: rand(1, 3), hargaSatuan: p.hargaJual }));
        const total = items.reduce((s, i) => s + i.qty * i.hargaSatuan, 0);
        const aId = anggotaIds[rand(0, anggotaIds.length - 1)];

        await client.query(`
          INSERT INTO transaksi (unit_usaha_id, anggota_id, operator_id, total_harga, tanggal, keterangan, items)
          VALUES ($1,$2,$3,$4,$5,'Transaksi unit pertanian',$6)
        `, [unitId2, aId, operatorUserId, String(total), tgl, JSON.stringify(items)]);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Seed berhasil! Database telah diisi data demo.');
    console.log(`   • Koperasi ID utama: ${koperasiId}`);
    console.log(`   • ${anggotaIds.length} anggota`);
    console.log(`   • ${pinjamanDefs.length} pinjaman (aktif, lunas, pending, macet)`);
    console.log(`   • 2 unit usaha aktif (warung + pertanian)`);
    console.log(`   • Transaksi 7 bulan terakhir`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed gagal:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
