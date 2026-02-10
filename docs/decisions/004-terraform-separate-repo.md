# ADR-004: Terraform in Separate Repository

**Status:** Accepted
**Date:** 2026-02-09

## Context

Infrastructure-as-code (Terraform) needs to live somewhere. Options: in the app repo, or in a dedicated repo.

## Decision

Terraform lives in a **separate repository** (`webapp-tf`) from the application code (`webapp`).

## Rationale

- **Separation of concerns** — infra changes have different review/approval cycles than app changes
- **Access control** — Terraform state contains sensitive info (DB IDs, account IDs); separate repo can have tighter access
- **Independent lifecycle** — infra is provisioned once and rarely changes; app deploys frequently
- **Reusability** — the Terraform patterns can be templated for other projects
- **State safety** — avoids accidental `terraform destroy` during routine app development

## Repository Layout

```
webapp-tf/
├── main.tf
├── d1.tf
├── r2.tf
├── dns.tf
├── queues.tf           # Documentation only (no TF support for Queues yet)
├── variables.tf
├── outputs.tf
└── envs/
    ├── example.tfvars  # Committed template
    ├── uat.tfvars      # Gitignored
    └── prod.tfvars     # Gitignored
```

## Consequences

- Must manually copy Terraform outputs (D1 database IDs) into `webapp/wrangler.jsonc`
- Infrastructure and app deployments are not atomic — deploy infra first, then app
- Two repos to maintain, but infra repo changes infrequently
