---
name: SCMS Orval mutation hooks
description: How to call Orval-generated React Query mutation hooks correctly in this project
---

Orval-generated mutation hooks (e.g. `useUpdateComplaint`, `useDeleteComplaint`) expect a flat argument shape:

```ts
mutate({ id, data: { status: "Resolved" } })
```

**Why:** it's easy to assume path params are nested under a `params` key (as some other codegen tools do), e.g. `mutate({ params: { id }, data })`. That shape silently fails or mistypes at compile time depending on the generated types — this has caused real bugs in the admin complaints page (delete and status-update actions).

**How to apply:** whenever wiring up a new Orval mutation hook that has a path parameter, check the generated hook's type signature first rather than guessing the shape.
