# ADR-001: Cloudflare Queues vs Durable Objects for Async Jobs

**Status:** Accepted
**Date:** 2026-02-09

## Context

The webapp needs async background processing for:
- Sending contact form emails via Resend
- Future image processing (resize, optimize uploads)
- Future scheduled tasks (sitemap regeneration)

Cloudflare offers two primitives for this: **Queues** and **Durable Objects**.

## Decision

Use **Cloudflare Queues** for all async job processing. Reserve **Durable Objects** for future rate-limiting needs only.

## Comparison

| Criteria | Queues | Durable Objects |
| -------- | ------ | --------------- |
| Purpose | Message queue with at-least-once delivery | Stateful serverless with persistent storage |
| Batching | Native (configurable batch size/timeout) | Manual implementation |
| Retries | Built-in (configurable, up to 5) | Manual implementation |
| Dead letter queue | Built-in | Manual implementation |
| Pricing | $0.40/million operations (~$1.20/M messages) | Wall-clock billing + storage |
| Complexity | Low — producer/consumer pattern | High — requires class definition, routing |
| Throughput | 5,000 msg/sec per queue | ~1,000 req/sec per object |
| Best for | Fire-and-forget jobs, batch processing | Stateful apps, strong consistency, coordination |

## Rationale

- Email sending is a textbook queue use case — fire message, process async, retry on failure
- Queues have native DLQ support for permanently failed messages
- Durable Objects are overkill for simple job processing — they're designed for stateful coordination
- Queues pricing is straightforward and predictable
- Queues free plan includes 10,000 operations/day — sufficient for development

## Consequences

- Queue consumer integration with OpenNext's generated worker needs validation
- May need a wrapper worker that re-exports from `.open-next/worker.js` and adds `queue()` handler
- Terraform cannot manage Queues yet — must create via wrangler CLI or dashboard
- If rate limiting is needed later, revisit with Durable Objects (5ms latency, strong consistency)
