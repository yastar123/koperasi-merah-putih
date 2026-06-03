# Sistem Koperasi Merah Putih

Aplikasi manajemen koperasi desa berbasis web untuk program Koperasi Merah Putih Indonesia — mencakup simpan pinjam, unit usaha, laporan keuangan, dan distribusi SHU.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — jalankan API server (port 8080)
- `pnpm --filter @workspace/koperasi run dev` — jalankan frontend (port 24729)
- `pnpm run typecheck` — typecheck semua package
- `pnpm run build` — typecheck + build semua package
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks dan Zod schema dari OpenAPI spec
- `pnpm --filter @workspace/db run push` — push perubahan DB schema (dev only)
- Required env: `DATABASE_URL` — PostgreSQL connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Recharts + Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/koperasi/` — React frontend (5 role dashboards, POS, laporan)
- `artifacts/api-server/` — Express backend dengan semua route
- `lib/db/src/schema/` — Drizzle schema (users, koperasi, anggota, simpanan, pinjaman, angsuran, unit_usaha, produk, transaksi, aktivitas_log)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth untuk API contract)
- `lib/api-spec/src/generated/` — Generated hooks & Zod schemas

## Architecture decisions

- **Session-based auth**: Cookie `session` berisi Base64(JSON{userId}), tidak menggunakan JWT library. Password di-hash SHA256 + salt `koperasi_salt`.
- **Contract-first API**: OpenAPI spec ditulis dulu, lalu hooks di-generate via Orval. Client menggunakan generated React Query hooks.
- **Role-based routing**: 5 role (super_admin, pengurus, pengawas, anggota, operator_unit) masing-masing punya layout & sidebar berbeda.
- **Proxy routing**: Frontend di `/`, API di `/api` — keduanya diakses via shared reverse proxy Replit.

## Product

- **Super Admin (Dinas Koperasi)**: Dashboard nasional, kelola semua koperasi, verifikasi, laporan agregat
- **Pengurus**: Dashboard koperasi, kelola anggota, simpanan, pinjaman, unit usaha, laporan keuangan & SHU
- **Pengawas**: Dashboard audit, laporan keuangan, log aktivitas sistem
- **Anggota**: Dashboard pribadi, kartu anggota digital, riwayat simpanan & pinjaman, katalog unit usaha
- **Operator Unit**: POS sistem, manajemen stok, riwayat transaksi

## Demo Accounts (semua password: `password123`)

| Username | Role | Koperasi |
|---|---|---|
| superadmin | super_admin | Nasional |
| pengurus1 | pengurus | Koperasi Sukamaju |
| pengawas1 | pengawas | Koperasi Sukamaju |
| anggota1 | anggota | Koperasi Sukamaju |
| operator1 | operator_unit | Koperasi Sukamaju |

## Gotchas

- Setelah menambah/mengubah schema DB, jalankan `pnpm run typecheck:libs` untuk rebuild DB lib sebelum typecheck API server.
- Setelah mengubah OpenAPI spec, jalankan codegen lagi untuk update generated hooks.
- `pnpm run dev` di root **tidak ada** — selalu gunakan `--filter` per artifact.

## Pointers

- Lihat skill `pnpm-workspace` untuk struktur workspace, TypeScript setup, dan package details
