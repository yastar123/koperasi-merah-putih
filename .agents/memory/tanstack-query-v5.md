---
name: TanStack Query v5 queryKey requirement
description: Orval-generated hooks in this project require an explicit queryKey in every query options object passed to useQuery wrappers.
---

Every call that passes `{ query: { enabled: ... } }` to an Orval-generated hook must also include `queryKey: []`:

```ts
// WRONG — fails TypeScript:
useGetSomething(params, { query: { enabled: !!id } });

// CORRECT:
useGetSomething(params, { query: { queryKey: [], enabled: !!id } });
```

**Why:** TanStack Query v5 made `queryKey` required in `UseQueryOptions`. Orval's factory overrides it at runtime with the real key, so `[]` is a safe placeholder.

**How to apply:** Any time you add or edit a generated hook call with a `query:` options object, always include `queryKey: []`.
