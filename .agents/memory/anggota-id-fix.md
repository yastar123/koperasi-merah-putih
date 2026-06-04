---
name: Anggota ID vs User ID
description: The anggota table has its own id separate from the users table; all anggota-facing API calls must use anggota.id, not user.id.
---

The `anggota` table has its own `id` (PK) and a separate `user_id` FK referencing the users table. They are **different values** — do not use `user.id` as `anggotaId` in API calls.

**Why:** API endpoints like `GET /simpanan/saldo/:anggotaId`, `GET /simpanan?anggotaId=`, and `GET /pinjaman?anggotaId=` all expect the anggota table's PK, not the user's id.

**How to apply:** In any anggota-role page that needs anggota-specific data, import and call the `useCurrentAnggota` hook from `@/hooks/use-current-anggota`. It calls `listAnggota({ userId: user?.id })` to resolve the anggota record, then exposes `{ anggota, anggotaId, isLoading }`. Gate all dependent queries on `!!anggotaId`.

The API endpoint `GET /anggota?userId=N` was added to support this lookup.
