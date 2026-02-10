# ADR-003: Two-Tier Release Strategy (UAT + Production)

**Status:** Accepted
**Date:** 2026-02-09

## Context

The webapp needs a reliable way to test changes before they reach production users. We need environment isolation for databases, assets, queues, and deployments.

## Decision

Two-tier release model with full resource isolation:

- `main` branch → **UAT** environment
- `release` branch → **Production** environment

## Resource Isolation

Every Cloudflare resource is duplicated per environment:

| Resource | UAT | Production |
| -------- | --- | ---------- |
| Worker | `webapp-uat` | `webapp` |
| D1 | `webapp-uat-db` | `webapp-prod-db` |
| R2 (assets) | `webapp-uat-assets` | `webapp-prod-assets` |
| R2 (cache) | `webapp-uat-cache` | `webapp-prod-cache` |
| Queue | `webapp-uat-email-queue` | `webapp-prod-email-queue` |
| DLQ | `webapp-uat-email-dlq` | `webapp-prod-email-dlq` |

## Terraform

- Managed via **workspaces**: `terraform workspace select uat` / `prod`
- Per-environment tfvars: `envs/uat.tfvars`, `envs/prod.tfvars`
- Same Terraform code, different variable values

## Wrangler

- Single `wrangler.jsonc` with `env.uat` and `env.prod` sections
- Deploy with `--env uat` or `--env prod`
- Secrets set per-env: `wrangler secret put KEY --env uat`

## Application Code

- Zero environment-specific code — bindings resolve automatically based on deployed env
- Runtime config (SITE_URL, etc.) comes from wrangler secrets
- `ENVIRONMENT` var (set in `wrangler.jsonc` per env, not a secret) available at runtime for `robots.ts`, `sitemap.ts`, etc.

## Git Flow

```
feature/* → main (UAT) → release (Production)
```

- PRs merge into `main`, trigger UAT deploy
- After QA, merge `main` into `release`, trigger prod deploy
- Hotfixes branch from `release`, merge into both `release` and `main`

## Consequences

- Double the Cloudflare resources (but D1/R2/Queues free tier is generous)
- Migrations must be applied to each environment separately
- Secrets must be set per environment
- UAT data is independent — can seed freely without affecting production
