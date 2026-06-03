---
name: null vs undefined in Orval hook params
description: user?.koperasiId and user?.id are number|null|undefined but API hook first-params expect number|undefined — must strip null.
---

`user?.koperasiId` and `user?.id` (from `useAuth()`) are typed `number | null | undefined` because the DB column allows null. Orval-generated hook first-params accept `number | undefined` (not null).

**Fix pattern:**
```ts
// WRONG — TS error:
useListAnggota({ koperasiId: user?.koperasiId }, ...);

// CORRECT:
useListAnggota({ koperasiId: user?.koperasiId ?? undefined }, ...);
```

**How to apply:** Whenever passing `user?.koperasiId` or `user?.id` into a hook params object, always add `?? undefined`.
