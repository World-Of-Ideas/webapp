# Feature Directory

Product-specific features live here. The upstream template never touches `src/features/`, making merges safe.

## Structure

```
src/features/{name}/
  components/   — React components
  lib/          — Business logic
  api/          — API route handlers (mount in src/app)
  types/        — TypeScript types
```

## Adding a Feature

1. Create `src/features/{name}/` with the structure above
2. Add routes under `src/app/(public)/{name}/` (import from `src/features/{name}/`)
3. Add a feature flag key via Admin > Settings > Features (the `features` JSON is extensible via `Record<string, boolean>`)
4. Guard routes and nav links with the new key
5. The feature directory is excluded from upstream template merges
