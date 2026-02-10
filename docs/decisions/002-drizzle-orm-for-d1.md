# ADR-002: Drizzle ORM for D1 Database Access

**Status:** Accepted
**Date:** 2026-02-09

## Context

The webapp uses Cloudflare D1 (SQLite at the edge) for data storage. We need to choose how to interact with it: raw SQL via D1 client, or an ORM/query builder.

## Decision

Use **Drizzle ORM** with `drizzle-kit` for schema definition, migrations, and all database queries.

## Rationale

- **Type-safe queries** — Drizzle infers TypeScript types from the schema, no manual type definitions needed
- **D1 native support** — `drizzle-orm/d1` driver works directly with the D1 binding
- **Lightweight** — Drizzle adds minimal bundle size compared to Prisma
- **Edge compatible** — no heavy runtime, works on Cloudflare Workers
- **Migration workflow** — `drizzle-kit generate` produces plain SQL files that `wrangler d1 migrations apply` can execute directly
- **Schema as code** — single source of truth in `src/db/schema.ts`

## Migration Workflow

```
Edit schema.ts → drizzle-kit generate → wrangler d1 migrations apply
```

1. Drizzle-kit generates `.sql` files into `drizzle/`
2. Wrangler applies them to the target D1 database (local, UAT, or prod)
3. Same migration files are applied to all environments in order

## Consequences

- Schema changes require running `db:generate` before deploying
- Drizzle-kit does not apply migrations directly to D1 — wrangler handles that
- No Prisma-style `migrate dev` auto-apply — manual two-step process
- `drizzle.config.ts` only needs `dialect: "sqlite"` — no DB credentials needed since wrangler handles the connection
