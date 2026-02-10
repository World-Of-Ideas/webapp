# Webapp — Implementation Plan

## Context

Reusable **product launch landing page template** deployed on Cloudflare Pages via OpenNext. Cloned and customized for every new mobile or web app launch. The site funnels organic traffic (via blog SEO) into a **waiting list with referral tracking** and a **viral giveaway page** to amplify signups before launch.

**Product types supported:**
- **Mobile apps**: marketing site at `www.example.com`, app distributed via App Store / Play Store
- **Web apps**: marketing site at `www.example.com`, actual app at `app.example.com` (separate Cloudflare Pages deployment or different hosting entirely — completely independent from this template)

The marketing site (this template) and the actual product are **fully decoupled**: separate repos, separate deployments, separate domains. Deploying the marketing site never affects the product app, and vice versa.

**Two-tier release model:**
- `main` branch → **UAT** environment
- `release` branch → **Production** environment

Each environment has its own isolated D1 database, R2 buckets, Queues, and Worker deployment.

---

## Repositories

| Repo | Path | Purpose |
| ---- | ---- | ------- |
| **webapp-plan** | `/Users/devsoul/Workspace/woi/webapp-plan` | Planning documents (this repo) |
| **webapp** | `/Users/devsoul/Workspace/woi/webapp` | Next.js application code |
| **webapp-tf** | `/Users/devsoul/Workspace/woi/webapp-tf` | Cloudflare Terraform infrastructure |

---

## Current State of `webapp`

Already scaffolded via `create-cloudflare`:

| What | Version / State |
| ---- | --------------- |
| Next.js | 16.0.7 |
| React | 19.2.1 |
| Tailwind CSS | v4.1.17 (PostCSS plugin) |
| @opennextjs/cloudflare | 1.14.0 |
| wrangler | 4.56.0 |
| TypeScript | 5.9.3 (strict) |
| Fonts | Geist Sans + Geist Mono (via `next/font`) |
| Path alias | `@/*` → `./src/*` |
| Pages | Only default `page.tsx` + `layout.tsx` |
| env.d.ts | Auto-generated Cloudflare types |

**Not yet set up:** shadcn/ui, Drizzle, D1 bindings, R2 bindings, Queues, any real pages/components.

---

## Chosen Stack

| Layer             | Choice                                     |
| ----------------- | ------------------------------------------ |
| Framework         | Next.js 16 (App Router)                    |
| Deployment        | Cloudflare Pages via OpenNext              |
| Styling           | Tailwind CSS v4 + shadcn/ui               |
| Database          | Cloudflare D1 (SQLite at the edge)         |
| ORM               | Drizzle ORM + drizzle-kit                  |
| Asset Storage     | Cloudflare R2 (S3-compatible objects)      |
| Incremental Cache | R2-backed via OpenNext                     |
| Async Jobs        | Cloudflare Queues (email, notifications)   |
| Email             | Resend (confirmation, referral, giveaway)  |
| Bot Protection    | Cloudflare Turnstile (waitlist, giveaway, contact forms) |
| Auth (admin)      | Simple token/password auth for /admin      |
| Infrastructure    | Terraform (cloudflare provider ~> 5.0)     |
| Package manager   | npm                                        |

---

## 1. Common Page Elements

Every public page (not admin) includes these elements:

| Element | Description | Data source |
| ------- | ----------- | ----------- |
| **Header** | Logo, nav links, CTA button, mobile hamburger | `config/navigation.ts` |
| **Breadcrumbs** | `Home > Section > Page` trail | Auto-generated from route path + page titles |
| **FAQs** | Collapsible FAQ accordion per page | D1 `pages` table (static pages) or `posts.faqs` column (blog posts) |
| **Related Pages** | Links to other relevant pages | D1 `pages` table (static pages) or auto-queried by tags (blog posts) |
| **Footer** | Link groups, tagline, social icons, legal links | `config/navigation.ts` |

### Breadcrumbs

- Rendered as `Home > Blog > Post Title` using semantic `<nav aria-label="Breadcrumb">` + `<ol>`
- JSON-LD `BreadcrumbList` schema emitted alongside page-specific JSON-LD
- Config in `config/navigation.ts` maps route segments to display names
- Blog posts derive breadcrumb label from post title

### FAQs

- Rendered as a collapsible accordion section above the footer
- JSON-LD `FAQPage` schema emitted per page (Google rich results eligible)
- **All pages**: FAQs stored in D1, editable via admin panel
  - Static pages: `pages.faqs` JSON column, keyed by route slug
  - Blog posts: `posts.faqs` JSON column, per-post
- If a page has no FAQs, the section is simply not rendered

### Related Pages

- Rendered as a card row (3-4 cards) between FAQs and footer
- **Static pages**: `pages.relatedPages` JSON column in D1 — curated per route via admin (e.g. waitlist page shows giveaway + blog links)
- **Blog posts**: auto-queried from D1 — posts sharing the same tags, excluding current post, limited to 3

---

## 2. Pages & Features

### 2.1 Landing Page (`/`)

The primary page. Everything funnels here.

- **Hero section**: app name, one-line value proposition, app mockup/preview image (from R2)
- **Primary CTA**: adaptive — waitlist signup form (pre-launch) or app/store buttons (post-launch)
- **Features section**: 3-4 value props with icons explaining the upcoming app
- **Social proof / counter**: "X people already on the waiting list" (live count from D1)
- **Latest blog posts**: 3 recent posts to show activity
- **FAQs**: "What is [product]?", "When does it launch?", "Is the waiting list free?", etc.
- **Related pages**: waitlist, giveaway, blog
- **JSON-LD**: `WebSite` + `Organization` + `BreadcrumbList` + `FAQPage`

### 2.2 Waiting List (`/waitlist`)

Dedicated page for the waiting list signup + referral dashboard.

**Signup flow:**
1. User enters name + email, completes Turnstile CAPTCHA
2. Server verifies Turnstile token, validates input
3. If email already exists → return existing referral code (client redirects to their dashboard)
4. Server generates a unique referral code (e.g. `abc123`)
5. Saves to D1 with position number
6. Queues confirmation email via Resend
7. Redirects to `/waitlist/[referral_code]` — their personal referral dashboard

**Referral dashboard (`/waitlist/[code]`):**
- Shows their position: "You are #42 on the waiting list"
- Shows referral count: "You've referred 3 people"
- Unique referral link: `${SITE_URL}/waitlist?ref=abc123` (domain from runtime secret)
- Social share buttons (Twitter/X, copy link)
- "Each referral moves you up the list"

**Referral mechanics:**
- When someone signs up via `?ref=abc123`, the referrer's `referral_count` increments
- **Atomic increment**: use `SET referral_count = referral_count + 1` (Drizzle `sql` operator), never read-then-write — prevents lost updates under concurrent signups
- Position is recalculated: base position minus (referrals × boost factor from `pages.metadata`)
- Boost factor stored in waitlist page's `pages.metadata`: `{ "boostFactor": 5 }` (each referral = 5 positions up)
- Simple formula, no complex leaderboard — just moves you up

**FAQs**: "How does the referral system work?", "When will I get access?", "Can I sign up more than once?"
**Related pages**: giveaway, blog, landing

### 2.3 Giveaway Page (`/giveaway`)

Viral giveaway to amplify waiting list signups.

**Entry mechanism:**
- Base entry: sign up with email + Turnstile CAPTCHA (or already on waiting list = auto-entered)
- **Server-side enforcement**: both `/api/giveaway/enter` and `/api/giveaway/action` must check `pages.metadata.endDate` and reject with `GIVEAWAY_ENDED` error if expired
- Bonus entries for social actions:
  - Share on Twitter/X (+3 entries)
  - Follow on Twitter/X (+2 entries)
  - Refer a friend who enters (+5 entries per friend)
- Each action tracked in D1 per user
- **Atomic increment**: `totalEntries` updated via `SET total_entries = total_entries + N` in same transaction as action insert

**Page content:**
- Prize description + image (from R2)
- Entry form (email, or "you're already entered" if on waiting list)
- Action cards: "Do X for +N entries" with completion status
- Total entries counter: "You have 12 entries"
- Countdown timer (end date from `pages.metadata` in D1 for the giveaway page)
- Terms & conditions link (→ `/terms`)
- JSON-LD: `Event` schema

**Verification:**
- Twitter share: generate a unique share URL, verify via callback or honor system
- Twitter follow: honor system with manual verification option later
- Referrals: tracked automatically via referral codes

**FAQs**: "How do bonus entries work?", "When is the giveaway drawn?", "Who is eligible?"
**Related pages**: waitlist, blog, landing

### 2.4 Blog (`/blog` + `/blog/[slug]`)

SEO engine that drives organic traffic. Pre-launch: funnels readers to the waitlist. Post-launch: drives traffic to the product via adaptive CTAs.

**Listing page:**
- Grid of post cards (paginated, 12 per page via `?page=N` query param)
- Posts from D1, cover images from R2
- Prev/Next pagination links (SEO-friendly `<link rel="prev/next">`)
- JSON-LD: `Blog`

**Individual post (`/blog/[slug]`):**
- Full post content rendered from **content blocks** stored as JSON in D1 (see section 3.A)
- Author, publication date (`publishedAt`), tags
- CTA at the bottom: adaptive (waitlist signup or product links — also embeddable inline via `cta` content block)
- **FAQs**: optional per-post FAQs from `posts.faqs` JSON column (editable in admin)
- **Related posts**: 3 posts with matching tags, auto-queried from D1
- `generateMetadata()` — dynamic OG per post
- JSON-LD: `BlogPosting` + `BreadcrumbList` + `FAQPage` (if FAQs present)

### 2.5 Contact Page (`/contact`)

For support inquiries, press, partnerships — not the primary conversion.

- Simple form: name, email, message + Turnstile CAPTCHA
- Stores in D1
- Queues email notification via Resend
- **FAQs**: "How long until I hear back?", "Can I partner with you?", "Where are you based?"
- **Related pages**: waitlist, blog, landing
- JSON-LD: `ContactPage` + `BreadcrumbList` + `FAQPage`

### 2.6 Admin Panel (`/admin`)

Simple admin for non-devs to manage blog content and page metadata.

**Auth:**
- Single admin password stored as wrangler secret (`ADMIN_PASSWORD`)
- Cookie-based session after login
- Session cookie attributes: `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/admin`
- No user accounts — single shared password per environment

**Features:**
- `/admin` — login page
- `/admin/dashboard` — overview (subscriber count, recent signups, post count)
- `/admin/posts` — list all blog posts (draft + published)
- `/admin/posts/new` — create new post with block-based editor (see section 3.A)
- `/admin/posts/[id]/edit` — edit existing post
- `/admin/pages` — list all pages: system pages (home, waitlist, etc.) + content pages (pillar, subpages) with hierarchy
- `/admin/pages/new` — create new content page (slug, parent, content blocks, description, cover image)
- `/admin/pages/[slug]/edit` — edit page (FAQs, related pages, content blocks, metadata, description, cover image, publish/unpublish)
- `/admin/subscribers` — view waiting list subscribers with referral counts
- `/admin/giveaway` — view giveaway entries and action counts
- `/admin/seo` — SEO audit dashboard (content health across all pages)

**Block-based post editor:**
- Add/remove/reorder content blocks visually
- Block type selector: paragraph, heading, list, image, callout, quote, table, cta
- Inline image upload to R2 within image blocks
- Live preview of rendered blocks
- Auto-generate slug from title
- Tags as multi-select input (stored as JSON array)
- Cover image upload (separate from content blocks)
- Delete post requires confirmation dialog (irreversible)

**SEO audit dashboard (`/admin/seo`):**
- Table of all public pages + published blog posts
- Per-row indicators (green/yellow/red):
  - **Title**: present + length (30-60 chars ideal)
  - **Description**: present + length (120-160 chars ideal)
  - **FAQs**: count (0 = red, 1+ = green)
  - **Related pages/posts**: count
  - **OG image**: present or missing
  - **JSON-LD types**: which schemas are emitted
  - **Tags** (posts only): count (0 = yellow)
  - **Cover image** (posts only): present or missing
- Summary row: "7/9 pages fully optimized"
- Links to edit each page/post directly from the audit table

### 2.7 Terms of Use (`/terms`)

Legal page — required for waitlist email collection and giveaway.

- Content rendered from **content blocks** in `pages.content` (same system as blog posts)
- Editable via admin at `/admin/pages/terms/edit`
- JSON-LD: `WebPage` + `BreadcrumbList`

### 2.8 Privacy Policy (`/privacy`)

Legal page — required for collecting personal data (emails, names).

- Content rendered from **content blocks** in `pages.content`
- Editable via admin at `/admin/pages/privacy/edit`
- JSON-LD: `WebPage` + `BreadcrumbList`

### 2.9 Content Pages (`/[...slug]` — pillar pages, subpages, guides, etc.)

Arbitrary content pages created via admin — not blog posts (which are time-stamped and tag-driven). Used for SEO pillar page strategy, resource hubs, guides, and any evergreen content.

**Examples:**
- `/guides` — pillar page listing all guide subpages
- `/guides/email-marketing` — subpage under the guides pillar
- `/resources` — standalone content page
- `/about` — standalone content page

**How it works:**
- Catch-all route `app/[...slug]/page.tsx` queries D1 `pages` table by slug
- Next.js static routes take priority — `/blog`, `/waitlist`, `/contact`, etc. still use their dedicated routes
- If no page found in D1 → `notFound()` (renders 404)
- Content rendered from `pages.content` (content blocks), same system as blog posts and legal pages

**Pillar pages (pages with children):**
- A page is a "pillar" when other pages have `parentSlug` pointing to it
- Pillar pages render: own content blocks → child pages grid (auto-queried) → FAQs → related pages
- Child pages grid: card with title, description, cover image, sorted by `sortOrder`
- Breadcrumbs follow hierarchy: `Home > Guides > Email Marketing`

**Admin management:**
- Create new content pages with any slug (validated against reserved slugs)
- Set optional parent page (for pillar/subpage hierarchy)
- Drag-to-reorder pages within a parent (`sortOrder`)
- Full block editor for content (reuses post editor)
- Cover image upload, description, FAQs, related pages
- Publish/unpublish toggle

**Reserved slugs** (cannot be used for content pages):
`home`, `waitlist`, `giveaway`, `contact`, `blog`, `terms`, `privacy`, `admin`, `api`, `feed.xml`

**JSON-LD:** `WebPage` + `BreadcrumbList` + `FAQPage` (if FAQs present)

### 2.10 Search (`Cmd+K`)

Global search across all published content — blog posts and content pages.

**User experience:**
- Search icon in header with `⌘K` hint (shows `Ctrl+K` on Windows)
- Opens a modal dialog (shadcn/ui `Command` component, powered by cmdk)
- Debounced text input — results update as user types
- Results grouped by type: **Pages**, **Blog Posts**
- Each result shows: title, excerpt (truncated description), URL
- Keyboard navigation: `↑`/`↓` to select, `Enter` to open, `Esc` to close
- Empty state: "No results found" with suggestion to browse blog

**API:**
- `GET /api/search?q=term` — searches `posts.title`, `posts.description`, `pages.title`, `pages.description` using `LIKE '%term%'`
- Returns `{ pages: [...], posts: [...] }` — max 5 results per type
- Only searches published content
- Minimum query length: 2 characters

**Future:** SQLite FTS5 virtual tables for ranked full-text search (better relevance than LIKE)

### 2.11 404 Page (`not-found.tsx`)

Custom 404 with link back to home and adaptive CTA:
- **Pre-launch** (`features.waitlist = true`): "Join the waiting list" link
- **Post-launch** (`features.waitlist = false`): "Try [Product Name]" link to `siteConfig.productLinks` (app/store)
- Falls back to just "Go home" link if neither waitlist nor product links are configured

---

## 3. Content Block System

Inspired by podshot-website's JSON content block architecture, but stored in D1 instead of static JSON files — making it fully dynamic and manageable via the admin panel.

### 3.A Content Block Types

Blog post content is stored as a JSON array of typed content blocks in the `posts.content` column. A `ContentRenderer` component maps each block to its React component.

```ts
// src/types/content.ts

export type ContentBlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "image"
  | "callout"
  | "quote"
  | "table"
  | "cta";

export interface ContentBlock {
  type: ContentBlockType;
  // paragraph, heading, callout, quote, cta
  text?: string;
  // paragraph — optional inline link
  link?: string;
  linkText?: string;
  // heading — level (h2, h3, h4)
  level?: 2 | 3 | 4;
  // image — R2 URL + alt text
  image?: string;
  alt?: string;
  // list — items + ordered flag
  items?: string[];
  ordered?: boolean;
  // callout — variant
  variant?: "info" | "tip" | "warning";
  // table — headers + rows
  headers?: string[];
  rows?: string[][];
}
```

**Block types:**

| Block | Purpose | Admin UI |
| ----- | ------- | -------- |
| `paragraph` | Rich text with optional inline link | Textarea + optional link fields |
| `heading` | Section heading (h2, h3, h4) | Text input + level dropdown |
| `list` | Ordered or unordered list | Dynamic item inputs + ordered toggle |
| `image` | Full-width image from R2 | Upload button + alt text input |
| `callout` | Highlighted info/tip/warning box | Textarea + variant selector |
| `quote` | Block quote | Textarea |
| `table` | Data table with headers | Dynamic header/row inputs |
| `cta` | Adaptive CTA: waitlist form (pre-launch) or app/store links (post-launch) | Text input for custom message |

**Rendering:**

```
src/components/content/
├── content-renderer.tsx      # Maps ContentBlock[] → React components
├── blocks/
│   ├── paragraph-block.tsx
│   ├── heading-block.tsx
│   ├── list-block.tsx
│   ├── image-block.tsx
│   ├── callout-block.tsx
│   ├── quote-block.tsx
│   ├── table-block.tsx
│   └── cta-block.tsx
```

**Adaptive CTA block:** The `cta` block renders differently based on `siteConfig`:
- **Pre-launch** (`features.waitlist = true`): inline waitlist signup form with Turnstile
- **Post-launch** (`features.waitlist = false`): renders app/store link buttons from `siteConfig.productLinks` (web app, App Store, Play Store — whichever are non-empty)
- Checks `siteConfig.features.waitlist` at render time — no content change needed when transitioning from pre-launch to post-launch

**Key difference from podshot:** Content is stored in D1 (editable at runtime via admin) instead of static JSON files (requiring a redeploy). The block type system is simpler — 8 types vs. podshot's 9 — with `cta` replacing podshot's `waitlist` and `download` blocks merged into a single adaptive CTA concept.

---

## 4. Database Schema (Drizzle)

### 4.1 `subscribers` — Waiting list

```ts
export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),                         // referral_code of referrer
  referralCount: integer("referral_count").notNull().default(0),
  position: integer("position").notNull(),                 // initial signup position
  status: text("status").notNull().default("active"),      // "active" | "unsubscribed" | "invited"
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
```

### 4.2 `posts` — Blog (content blocks stored as JSON)

```ts
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content", { mode: "json" }).$type<ContentBlock[]>().notNull(),
  faqs: text("faqs", { mode: "json" }).$type<{ question: string; answer: string }[]>(),
  coverImage: text("cover_image"),                        // R2 URL
  author: text("author").notNull().default("Admin"),
  tags: text("tags", { mode: "json" }).$type<string[]>(), // JSON array — query via json_each()
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),                      // set when published flips to true
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
}, (table) => [
  index("idx_posts_listing").on(table.published, table.createdAt),
]);
```

The `content` column stores a JSON array of `ContentBlock` objects. Example:

```json
[
  { "type": "paragraph", "text": "Welcome to our launch announcement..." },
  { "type": "heading", "text": "What We're Building", "level": 2 },
  { "type": "paragraph", "text": "Check out our features.", "link": "/waitlist", "linkText": "Join the waitlist" },
  { "type": "image", "image": "https://assets.example.com/blog/screenshot.webp", "alt": "App screenshot" },
  { "type": "callout", "text": "Early adopters get 50% off at launch!", "variant": "tip" },
  { "type": "list", "items": ["Feature A", "Feature B", "Feature C"], "ordered": false },
  { "type": "cta", "text": "Be the first to try it — join the waiting list!" }
]
```

### 4.3 `contact_submissions` — Contact form

```ts
export const contactSubmissions = sqliteTable("contact_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
```

### 4.4 `giveaway_entries` — Giveaway participants

```ts
export const giveawayEntries = sqliteTable("giveaway_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  subscriberId: integer("subscriber_id").references(() => subscribers.id),
  totalEntries: integer("total_entries").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
```

### 4.5 `giveaway_actions` — Tracks completed bonus actions

```ts
export const giveawayActions = sqliteTable("giveaway_actions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entryId: integer("entry_id").notNull().references(() => giveawayEntries.id),
  action: text("action").notNull(),       // "twitter_share", "twitter_follow", "referral:{referredEmail}"
  bonusEntries: integer("bonus_entries").notNull(),
  metadata: text("metadata"),              // JSON: tweet URL, referred email, etc.
  completedAt: text("completed_at").notNull().default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex("uq_entry_action").on(table.entryId, table.action),  // prevents duplicate: twitter_share/twitter_follow are one-time; referral:{email} is unique per referred friend
  index("idx_actions_entry").on(table.entryId),                     // fast bonus entry sum per entry
]);
```

### 4.6 `pages` — System pages + content pages (pillar, subpages, guides)

```ts
export const pages = sqliteTable("pages", {
  slug: text("slug").primaryKey(),                       // "home", "guides/email-marketing", etc.
  parentSlug: text("parent_slug"),                       // null = top-level; "guides" = child of /guides
  title: text("title").notNull(),                        // Page display name (breadcrumbs, cards, admin)
  description: text("description"),                      // Meta description + card excerpt
  content: text("content", { mode: "json" }).$type<ContentBlock[]>(),  // Content blocks (terms, privacy, content pages)
  faqs: text("faqs", { mode: "json" }).$type<{ question: string; answer: string }[]>(),
  relatedPages: text("related_pages", { mode: "json" }).$type<{ title: string; description: string; href: string }[]>(),
  coverImage: text("cover_image"),                       // R2 URL — OG image + card display
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),  // Page-specific config (e.g. giveaway: endDate, prizes)
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0), // Ordering within parent
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
}, (table) => [
  index("idx_pages_parent").on(table.parentSlug),        // Fast child page queries
]);
```

Seeded with 7 system page rows. Content pages (pillar, subpages) created via admin at runtime.

**System pages** (seeded, `parentSlug = null`):
`home`, `waitlist`, `giveaway`, `contact`, `blog`, `terms`, `privacy`

**Content pages** (created via admin):
Any slug not in the reserved list — e.g. `guides`, `guides/email-marketing`, `resources`, `about`

**`metadata` examples by page:**

| Page slug | metadata contents |
| --------- | ----------------- |
| `waitlist` | `{ "boostFactor": 5 }` — each referral moves position up by this many spots |
| `giveaway` | `{ "endDate": "2026-04-01T00:00:00Z", "prizeTitle": "...", "prizeDescription": "...", "prizeImage": "https://assets.example.com/prize.webp", "bonusEntries": { "share": 3, "follow": 2, "referral": 5 } }` |
| Others | `null` (no page-specific config needed) |

### 4.7 `admin_sessions` — Admin auth

```ts
export const adminSessions = sqliteTable("admin_sessions", {
  id: text("id").primaryKey(),             // UUID session token
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  expiresAt: text("expires_at").notNull(),
}, (table) => [
  index("idx_sessions_expires").on(table.expiresAt),
]);

// Cleanup: on each login, delete expired sessions:
// DELETE FROM admin_sessions WHERE expires_at < datetime('now')
```

---

## 5. API Routes

| Route | Method | Description |
| ----- | ------ | ----------- |
| `/api/waitlist` | POST | Sign up: validate, insert subscriber, generate referral code, queue confirmation email |
| `/api/waitlist/[code]` | GET | Get position + referral count for a referral code |
| `/api/giveaway/enter` | POST | Enter giveaway (creates entry or links to existing subscriber) |
| `/api/giveaway/action` | POST | Record a bonus action (share, follow, referral) |
| `/api/contact` | POST | Submit contact form → D1 + queue email |
| `/api/unsubscribe` | GET | Verify signed token, set subscriber status to "unsubscribed" |
| `/api/blog` | GET | List published posts (paginated: `?page=1&limit=12`) |
| `/api/blog/[slug]` | GET | Single post (for mobile/external) |
| `/api/search` | GET | Search posts + pages by title/description (`?q=term`, max 5 per type, min 2 chars) |
| `/api/admin/login` | POST | Verify admin password, create session |
| `/api/admin/logout` | POST | Delete session |
| `/api/admin/posts` | GET/POST | List posts / create post |
| `/api/admin/posts/[id]` | PUT/DELETE | Update / delete post |
| `/api/admin/pages` | GET/POST | List all pages (system + content) / create new content page |
| `/api/admin/pages/[slug]` | PUT/DELETE | Update page (FAQs, related, content, metadata) / delete content page (system pages cannot be deleted) |
| `/api/admin/upload` | POST | Upload image to R2 (accepts image/webp, image/png, image/jpeg, image/gif; max 5 MB), return URL |
| `/api/admin/subscribers` | GET | List subscribers (paginated) |
| `/api/admin/giveaway` | GET | List giveaway entries + stats |
| `/api/admin/seo` | GET | SEO audit: content health check across all pages + posts |

### 5.1 Standard Error Response

All API routes return errors in a consistent shape:

```ts
// Success
{ "ok": true, "data": { ... } }

// Error
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "Email is required" } }
```

**Error codes:**

| Code | HTTP Status | When |
| ---- | ----------- | ---- |
| `VALIDATION_ERROR` | 400 | Missing/invalid input fields |
| `TURNSTILE_FAILED` | 400 | Turnstile token verification failed |
| `DUPLICATE_EMAIL` | 409 | Email already on waitlist / giveaway |
| `GIVEAWAY_ENDED` | 410 | Giveaway end date has passed |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `UNAUTHORIZED` | 401 | Missing/invalid admin session |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 5.2 Rate Limiting

- Turnstile provides bot protection on all public forms
- For MVP, no additional rate limiting is implemented
- **Future**: Cloudflare rate limiting rules (via dashboard or TF) or Durable Objects for per-IP throttling (see decision 001)

### 5.3 CORS

- Same-origin by default — no CORS headers needed for the web app itself
- **Future**: if a mobile app or external client needs API access, add CORS headers to public GET routes (`/api/blog`, `/api/blog/[slug]`, `/api/waitlist/[code]`) via a shared middleware

---

## 6. Queue Consumer (Email Processing)

The queue consumer processes email jobs asynchronously via Cloudflare Queues.

**Architecture:**
- Producer: API routes push messages to `EMAIL_QUEUE` with `{ type, payload }` shape
- Consumer: configured in `wrangler.jsonc` as a queue consumer on the same worker
- Dead letter queue: failed messages route to `EMAIL_DLQ` after 3 retries

**Message types:**

```ts
// src/lib/queue.ts
type EmailJob =
  | { type: "waitlist_confirmation"; payload: { email: string; name: string; position: number; referralCode: string } }
  | { type: "referral_notification"; payload: { email: string; name: string; newPosition: number } }
  | { type: "giveaway_confirmation"; payload: { email: string } }
  | { type: "contact_receipt"; payload: { name: string; email: string; message: string } };
```

**Consumer handler** (`src/lib/queue-consumer.ts`):
1. Reads message type from the batch
2. Calls Resend API with the appropriate email template
3. Acks the message on success; retries on failure

**OpenNext integration note:** OpenNext generates the worker entry point. The queue consumer must be registered alongside it. If OpenNext doesn't support queue consumers natively, a thin wrapper worker will be needed. Validate during implementation step 5.

---

## 7. Email Templates (via Resend, queued)

| Email | Trigger | Content |
| ----- | ------- | ------- |
| Waitlist confirmation | New signup | "You're in! Position #X. Share your link to move up." |
| Referral notification | Someone uses your code | "A friend joined via your link! You're now #Y." |
| Giveaway entry confirmation | New giveaway entry | "You're entered! Complete actions for bonus entries." |
| Contact form receipt | Contact form submit | Notification to `CONTACT_EMAIL` |

**Email compliance:**
- All outbound emails sent from `FROM_EMAIL` (wrangler secret — per product, per environment)
- All outbound emails include `List-Unsubscribe` header (Resend supports this natively)
- Unsubscribe link in email footer sets `subscribers.status = "unsubscribed"`
- Unsubscribed subscribers are excluded from future emails but remain in D1 for analytics
- Unsubscribe endpoint: `GET /api/unsubscribe?token={signed_token}` — verifies token, updates status

---

## 8. Environment & Release Strategy

### 8.1 Two-Tier Model

| Aspect          | UAT                              | Production                       |
| --------------- | -------------------------------- | -------------------------------- |
| Git branch      | `main`                           | `release`                        |
| Worker name     | `webapp-uat`                     | `webapp`                         |
| D1 database     | `webapp-uat-db`                  | `webapp-prod-db`                 |
| R2 assets       | `webapp-uat-assets`              | `webapp-prod-assets`             |
| R2 cache        | `webapp-uat-cache`               | `webapp-prod-cache`              |
| Email queue     | `webapp-uat-email-queue`         | `webapp-prod-email-queue`        |
| Email DLQ       | `webapp-uat-email-dlq`           | `webapp-prod-email-dlq`          |
| Domain          | `uat.example.com`                | `www.example.com`                |
| Robots          | `Disallow: /`                    | `Allow: /`                       |

### 8.2 Subdomain Strategy

This template deploys the **marketing site** only. The actual product app is a separate project.

| Subdomain | Purpose | Managed by |
| --------- | ------- | ---------- |
| `www.example.com` | Marketing site (this template) | This repo (`webapp`) |
| `uat.example.com` | Marketing site UAT | This repo (`webapp`) |
| `app.example.com` | Product web app (if applicable) | Separate repo/deployment |

- For **web apps**: the product lives at `app.example.com` (or any subdomain) — completely separate Cloudflare Pages project, different repo, different deploy pipeline
- For **mobile apps**: no `app.` subdomain needed — CTAs link to App Store / Play Store URLs
- The marketing site links to the product via `siteConfig.productLinks` — no deployment coupling
- DNS records for `app.` are managed outside this template's Terraform (separate TF project or manual)

### 8.3 Git Flow

```
feature/* ──→ main (UAT) ──→ release (Production)
```

---

## 9. `webapp-tf` — Terraform Infrastructure

Manages D1, R2 (assets + cache), DNS per environment via Terraform workspaces. Queues created manually via wrangler CLI (no TF provider support yet).

**Files:**

| File | Contents |
| ---- | -------- |
| `main.tf` | Cloudflare provider (`~> 5.0`), `account_id` + `zone_id` variables |
| `d1.tf` | `cloudflare_d1_database` — one DB per workspace (`webapp-{env}-db`) |
| `r2.tf` | `cloudflare_r2_bucket` × 2 — assets + cache per workspace |
| `dns.tf` | `cloudflare_record` — CNAME per workspace (`uat.example.com` / `www.example.com`) |
| `queues.tf` | Documentation only — manual `wrangler queues create` commands |
| `variables.tf` | `account_id`, `zone_id`, `domain`, `environment` with validation |
| `outputs.tf` | `d1_database_id`, `d1_database_name`, `r2_assets_bucket`, `r2_cache_bucket`, `environment` |
| `envs/example.tfvars` | Committed template with placeholder values |
| `envs/uat.tfvars` | Gitignored — real UAT values |
| `envs/prod.tfvars` | Gitignored — real Production values |

**Resource naming:** `{project}-{terraform.workspace}-{resource}` (e.g. `webapp-uat-db`, `webapp-prod-assets`).

The `project` prefix defaults to `webapp` in the template. When cloning for a new product, change this via the `project_name` Terraform variable (see `variables.tf`). The same prefix must be updated in `wrangler.jsonc` resource names. See `checklists/clone-template.md` for the full list of places to update.

**Workflow:**
```bash
terraform workspace select uat
terraform plan -var-file="envs/uat.tfvars"
terraform apply -var-file="envs/uat.tfvars"
# Copy d1_database_id output → webapp/wrangler.jsonc env.uat section
```

---

## 10. `webapp` — Configuration

### 10.1 `open-next.config.ts`

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
```

### 10.2 `wrangler.jsonc`

```jsonc
{
  "name": "webapp",
  "compatibility_date": "2025-06-01",
  "pages_build_output_dir": ".open-next",
  "env": {
    "uat": {
      "name": "webapp-uat",
      "vars": { "ENVIRONMENT": "uat" },
      "d1_databases": [
        { "binding": "DB", "database_name": "webapp-uat-db", "database_id": "<from terraform output>" }
      ],
      "r2_buckets": [
        { "binding": "ASSETS_BUCKET", "bucket_name": "webapp-uat-assets" },
        { "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "webapp-uat-cache" }
      ],
      "queues": {
        "producers": [{ "binding": "EMAIL_QUEUE", "queue": "webapp-uat-email-queue" }],
        "consumers": [{ "queue": "webapp-uat-email-queue", "dead_letter_queue": "webapp-uat-email-dlq", "max_retries": 3 }]
      }
    },
    "prod": {
      "name": "webapp",
      "vars": { "ENVIRONMENT": "prod" },
      "d1_databases": [
        { "binding": "DB", "database_name": "webapp-prod-db", "database_id": "<from terraform output>" }
      ],
      "r2_buckets": [
        { "binding": "ASSETS_BUCKET", "bucket_name": "webapp-prod-assets" },
        { "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "webapp-prod-cache" }
      ],
      "queues": {
        "producers": [{ "binding": "EMAIL_QUEUE", "queue": "webapp-prod-email-queue" }],
        "consumers": [{ "queue": "webapp-prod-email-queue", "dead_letter_queue": "webapp-prod-email-dlq", "max_retries": 3 }]
      }
    }
  }
}
```

### 10.3 Bindings (`src/types/env.d.ts`)

```ts
interface CloudflareEnv {
  // Bindings (configured in wrangler.jsonc)
  DB: D1Database;
  ASSETS_BUCKET: R2Bucket;
  NEXT_INC_CACHE_R2_BUCKET: R2Bucket;
  EMAIL_QUEUE: Queue;
  // Vars (set in wrangler.jsonc per env)
  ENVIRONMENT: "uat" | "prod";
  // Secrets (set via wrangler secret put)
  RESEND_API_KEY: string;
  FROM_EMAIL: string;           // Sender address for outbound emails (e.g. "hello@example.com")
  CONTACT_EMAIL: string;        // Receives contact form submissions
  SITE_URL: string;
  R2_PUBLIC_URL: string;
  ADMIN_PASSWORD: string;
  TURNSTILE_SECRET_KEY: string;
}
// Note: ASSETS (Fetcher) is auto-injected by Cloudflare Pages — do not declare manually
```

### 10.4 `drizzle.config.ts`

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
});
```

### 10.5 `next.config.ts` (image remotePatterns)

```ts
// Add to existing next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",        // R2 public URLs
      },
      // Add specific R2 custom domain when configured:
      // { protocol: "https", hostname: "assets.example.com" },
    ],
  },
};
```

### 10.6 Wrangler Secrets (per environment)

```bash
wrangler secret put SITE_URL --env uat
wrangler secret put R2_PUBLIC_URL --env uat
wrangler secret put RESEND_API_KEY --env uat
wrangler secret put FROM_EMAIL --env uat               # Sender address (e.g. "hello@example.com")
wrangler secret put CONTACT_EMAIL --env uat             # Receives contact form submissions
wrangler secret put ADMIN_PASSWORD --env uat
wrangler secret put TURNSTILE_SECRET_KEY --env uat
# repeat for --env prod
```

**Notes:**
- `ENVIRONMENT` is set as a `var` in `wrangler.jsonc` (not a secret) — available at runtime for robots.ts, sitemap, etc.
- Turnstile site key (public, not a secret) is stored in `src/config/site.ts`. During development, use Cloudflare's always-pass test keys.

### 10.7 Feature Toggles (`src/config/site.ts`)

When cloning the template for a new product, not every feature is needed. Feature toggles in `config/site.ts` control which major features are active:

```ts
// src/config/site.ts
export const siteConfig = {
  name: "Product Name",
  description: "One-line value proposition",
  url: "https://example.com",                       // Marketing site (www subdomain)

  // Product links — used by CTAs when waitlist is disabled (post-launch)
  productLinks: {
    appUrl: "",                                      // Web app URL (e.g. "https://app.example.com")
    appStoreUrl: "",                                 // iOS App Store URL
    playStoreUrl: "",                                // Google Play Store URL
  },

  // Social links — per-product, shown in footer + share buttons
  social: {
    twitter: "",                                     // e.g. "@productname" — also used for Twitter share CTAs
    github: "",
    discord: "",
    instagram: "",
  },

  // Turnstile site key (public, not a secret)
  turnstileSiteKey: "0x...",                         // Use Cloudflare always-pass test key in dev

  features: {
    waitlist: true,          // /waitlist, referral dashboard, subscriber count on landing
    giveaway: true,          // /giveaway, bonus actions, countdown timer
    blog: true,              // /blog, /blog/[slug], latest posts on landing
    contact: true,           // /contact, contact form
  },
};
```

**Impact when a feature is `false`:**

| Area | Behavior |
| ---- | -------- |
| **Routes** | Page calls `notFound()` → renders 404 |
| **Navigation** | Links filtered out of header + footer (navigation.ts marks each link's `feature` key) |
| **Sitemap** | URLs excluded from `sitemap.ts` |
| **RSS feed** | Excluded if blog is disabled |
| **Landing page** | Sections for disabled features hidden (e.g., no "Latest posts" if blog off); when waitlist off, primary CTA switches to app/store links from `siteConfig.productLinks` |
| **Admin sidebar** | Management sections hidden (e.g., no "Posts" if blog off, no "Giveaway" if giveaway off) |
| **API routes** | Return `NOT_FOUND` (404) for disabled features |
| **Seed data** | Pages table rows still seeded (admin can pre-populate), but public routes 404 |

**Navigation config with feature keys:**

```ts
// src/config/navigation.ts
export const headerLinks = [
  { label: "Waitlist", href: "/waitlist", feature: "waitlist" as const },
  { label: "Giveaway", href: "/giveaway", feature: "giveaway" as const },
  { label: "Blog", href: "/blog", feature: "blog" as const },
  { label: "Contact", href: "/contact", feature: "contact" as const },
];
// Header/Footer components filter: headerLinks.filter(l => siteConfig.features[l.feature])
```

**Route guard pattern:**

```ts
// In any feature page (e.g. app/giveaway/page.tsx):
import { siteConfig } from "@/config/site";
import { notFound } from "next/navigation";

export default function GiveawayPage() {
  if (!siteConfig.features.giveaway) notFound();
  // ...render page
}
```

---

## 11. `webapp` — Directory Structure

```
webapp/src/
├── app/
│   ├── layout.tsx                     # Root layout: Header + Footer + metadata
│   ├── page.tsx                       # Landing page (hero, waitlist CTA, features)
│   ├── globals.css                    # Tailwind v4 + shadcn theme
│   ├── favicon.ico
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── not-found.tsx
│   ├── feed.xml/
│   │   └── route.ts                   # RSS/Atom feed of published blog posts
│   │
│   ├── waitlist/
│   │   ├── page.tsx                   # Waitlist signup page
│   │   └── [code]/
│   │       └── page.tsx               # Referral dashboard (position, share link)
│   │
│   ├── giveaway/
│   │   └── page.tsx                   # Giveaway entry + bonus actions
│   │
│   ├── blog/
│   │   ├── page.tsx                   # Blog listing
│   │   └── [slug]/
│   │       └── page.tsx               # Blog post (renders content blocks)
│   │
│   ├── contact/
│   │   └── page.tsx                   # Contact form
│   │
│   ├── terms/
│   │   └── page.tsx                   # Terms of use (content blocks from pages table)
│   │
│   ├── privacy/
│   │   └── page.tsx                   # Privacy policy (content blocks from pages table)
│   │
│   ├── [...slug]/
│   │   └── page.tsx                   # Catch-all: content pages from D1 (pillar, subpages, guides)
│   │
│   ├── admin/
│   │   ├── page.tsx                   # Admin login
│   │   ├── layout.tsx                 # Admin layout (sidebar nav, session check)
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Admin dashboard (stats)
│   │   ├── posts/
│   │   │   ├── page.tsx               # List posts
│   │   │   ├── new/
│   │   │   │   └── page.tsx           # Create post (block editor)
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx       # Edit post (block editor)
│   │   ├── pages/
│   │   │   ├── page.tsx               # List all pages (system + content, with hierarchy)
│   │   │   ├── new/
│   │   │   │   └── page.tsx           # Create content page (block editor + parent selector)
│   │   │   └── [slug]/
│   │   │       └── edit/
│   │   │           └── page.tsx       # Edit page (content, FAQs, related, metadata)
│   │   ├── subscribers/
│   │   │   └── page.tsx               # View subscribers
│   │   ├── giveaway/
│   │   │   └── page.tsx               # View giveaway entries
│   │   └── seo/
│   │       └── page.tsx               # SEO audit dashboard
│   │
│   └── api/
│       ├── waitlist/
│       │   ├── route.ts               # POST: signup (validates Turnstile)
│       │   └── [code]/
│       │       └── route.ts           # GET: position + referrals
│       ├── giveaway/
│       │   ├── enter/
│       │   │   └── route.ts           # POST: enter giveaway (validates Turnstile)
│       │   └── action/
│       │       └── route.ts           # POST: record bonus action
│       ├── contact/
│       │   └── route.ts               # POST: contact form (validates Turnstile)
│       ├── unsubscribe/
│       │   └── route.ts               # GET: verify token, unsubscribe from emails
│       ├── blog/
│       │   ├── route.ts               # GET: list posts
│       │   └── [slug]/
│       │       └── route.ts           # GET: single post
│       ├── search/
│       │   └── route.ts               # GET: search posts + pages (?q=term)
│       └── admin/
│           ├── login/
│           │   └── route.ts           # POST: login
│           ├── logout/
│           │   └── route.ts           # POST: logout
│           ├── posts/
│           │   ├── route.ts           # GET/POST: list/create
│           │   └── [id]/
│           │       └── route.ts       # PUT/DELETE: update/delete
│           ├── pages/
│           │   ├── route.ts           # GET/POST: list all pages / create content page
│           │   └── [slug]/
│           │       └── route.ts       # PUT/DELETE: update page / delete content page
│           ├── upload/
│           │   └── route.ts           # POST: R2 image upload
│           ├── subscribers/
│           │   └── route.ts           # GET: list subscribers
│           ├── giveaway/
│           │   └── route.ts           # GET: giveaway stats
│           └── seo/
│               └── route.ts           # GET: SEO audit data
│
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── breadcrumbs.tsx            # Auto-generated breadcrumb trail
│   │   ├── faq-section.tsx            # Collapsible FAQ accordion
│   │   └── related-pages.tsx          # Related page cards (static pages)
│   ├── content/                       # Content block rendering system
│   │   ├── content-renderer.tsx       # Maps ContentBlock[] → React components
│   │   └── blocks/
│   │       ├── paragraph-block.tsx    # Text + optional inline link
│   │       ├── heading-block.tsx      # h2, h3, h4
│   │       ├── list-block.tsx         # Ordered / unordered list
│   │       ├── image-block.tsx        # Full-width R2 image
│   │       ├── callout-block.tsx      # Info / tip / warning box
│   │       ├── quote-block.tsx        # Block quote
│   │       ├── table-block.tsx        # Data table
│   │       └── cta-block.tsx          # Adaptive CTA (waitlist form or app/store links)
│   ├── waitlist/
│   │   ├── signup-form.tsx            # Name + email + Turnstile (client component)
│   │   ├── referral-dashboard.tsx     # Position, referral count, share buttons
│   │   └── subscriber-count.tsx       # "X people on the waitlist" counter
│   ├── giveaway/
│   │   ├── entry-form.tsx             # Giveaway entry + Turnstile
│   │   ├── action-card.tsx            # Bonus action card with completion state
│   │   └── countdown-timer.tsx        # Countdown to giveaway end
│   ├── blog/
│   │   ├── post-card.tsx              # Blog listing card
│   │   └── related-posts.tsx          # Related posts by tags (for blog detail)
│   ├── contact/
│   │   └── contact-form.tsx           # Contact form + Turnstile
│   ├── admin/
│   │   ├── login-form.tsx
│   │   ├── post-editor/               # Block-based post editor
│   │   │   ├── post-editor.tsx        # Main editor: metadata + block list
│   │   │   ├── block-list.tsx         # Sortable block list with add/remove/reorder
│   │   │   ├── block-editor.tsx       # Block type switch → specific editor
│   │   │   ├── paragraph-editor.tsx
│   │   │   ├── heading-editor.tsx
│   │   │   ├── list-editor.tsx
│   │   │   ├── image-editor.tsx       # Upload to R2 + alt text
│   │   │   ├── callout-editor.tsx
│   │   │   ├── quote-editor.tsx
│   │   │   ├── table-editor.tsx
│   │   │   └── cta-editor.tsx
│   │   ├── page-editor/               # Page editor (system + content pages)
│   │   │   ├── page-editor.tsx        # Main: content blocks + FAQs + related + metadata + parent selector
│   │   │   ├── faq-editor.tsx         # Add/remove/reorder FAQ items
│   │   │   └── related-pages-editor.tsx # Add/remove related page links
│   │   ├── image-upload.tsx           # Shared R2 upload component
│   │   ├── stats-card.tsx             # Dashboard stat card
│   │   └── data-table.tsx             # Generic data table for lists
│   ├── shared/
│   │   ├── turnstile.tsx              # Turnstile CAPTCHA wrapper (client component)
│   │   ├── json-ld.tsx                # Structured data component
│   │   └── search-dialog.tsx          # Cmd+K search modal (client component, cmdk)
│   └── ui/                            # shadcn/ui (auto-generated)
│
├── config/
│   ├── site.ts                        # Site name, description, URLs, social links, Turnstile site key
│   └── navigation.ts                  # Header links, footer groups, breadcrumb labels, CTA text
│
├── db/
│   ├── schema.ts                      # All 7 tables
│   ├── index.ts                       # Drizzle client factory
│   └── seed.ts                        # Sample posts (with content blocks) + test subscribers
│
├── lib/
│   ├── waitlist.ts                    # Subscriber queries + referral logic
│   ├── giveaway.ts                    # Giveaway entry + action queries
│   ├── blog.ts                        # Blog post queries
│   ├── pages.ts                       # Static page queries (FAQs, related pages)
│   ├── contact.ts                     # Contact submission queries
│   ├── admin.ts                       # Admin session queries
│   ├── r2.ts                          # R2 helpers (upload, public URL generation)
│   ├── queue.ts                       # Queue producer helpers
│   ├── resend.ts                      # Resend client
│   ├── referral.ts                    # Referral code generation + position calculation
│   ├── turnstile.ts                   # Server-side Turnstile token verification
│   ├── queue-consumer.ts              # Queue consumer handler (processes email jobs)
│   ├── seo.ts                         # SEO audit queries (content health per page/post)
│   ├── search.ts                      # Search queries (LIKE on title/description across posts + pages)
│   └── utils.ts                       # cn() helper
│
└── types/
    ├── content.ts                     # ContentBlock, ContentBlockType types
    └── env.d.ts                       # CloudflareEnv bindings
```

---

## 12. SEO

### 12.1 Sitemap

Dynamic — includes all system pages + published content pages + published blog posts from D1:
- `/`
- `/waitlist`
- `/giveaway`
- `/contact`
- `/blog`
- `/blog/[slug]` for each published post
- `/terms`
- `/privacy`
- `/[slug]` for each published content page (pillar pages, subpages, guides)

Admin pages excluded from sitemap. Disabled features excluded.

### 12.2 RSS Feed

- `app/feed.xml/route.ts` — generates Atom/RSS feed of published blog posts
- Includes title, description, publishedAt, link, author for each post
- Limited to 20 most recent published posts
- Linked from `<head>` via `<link rel="alternate" type="application/rss+xml">`
- Included in robots.txt alongside sitemap

### 12.3 Robots

- **UAT**: `Disallow: /`
- **Production**: `Allow: /`, `Disallow: /admin`, sitemap + RSS feed links

### 12.4 JSON-LD per page

| Page | Schema |
| ---- | ------ |
| Landing | `WebSite` + `Organization` + `BreadcrumbList` + `FAQPage` |
| Waitlist | `WebPage` + `BreadcrumbList` + `FAQPage` |
| Giveaway | `Event` + `BreadcrumbList` + `FAQPage` |
| Blog listing | `Blog` + `BreadcrumbList` |
| Blog post | `BlogPosting` + `BreadcrumbList` + `FAQPage` (if post has FAQs) |
| Contact | `ContactPage` + `BreadcrumbList` + `FAQPage` |
| Terms / Privacy | `WebPage` + `BreadcrumbList` |
| Content pages | `WebPage` + `BreadcrumbList` + `FAQPage` (if FAQs present) |

### 12.5 Every public page must have

- Unique `<title>` + `description`
- Open Graph + Twitter card tags
- One `<h1>`
- Semantic HTML
- Alt text on images
- Canonical URL
- Breadcrumbs (with `BreadcrumbList` JSON-LD)
- FAQ section (with `FAQPage` JSON-LD) — omitted only if no FAQs defined
- Related pages section

---

## 13. Implementation Order

| Step | Repo | Task |
| ---- | ---- | ---- |
| 1 | `webapp-tf` | Write all Terraform files |
| 2 | `webapp-tf` | Write `envs/example.tfvars`, `.gitignore` |
| 3 | `webapp` | Install deps (drizzle-orm, drizzle-kit, resend, @marsidev/react-turnstile, cmdk) |
| 4 | `webapp` | Initialize shadcn/ui + install components |
| 5 | `webapp` | Update `open-next.config.ts`, `next.config.ts` (remotePatterns), `wrangler.jsonc` (multi-env), `package.json` |
| 6 | `webapp` | Create `drizzle.config.ts` |
| 7 | `webapp` | Create Drizzle schema (all 7 tables with indexes, posts.content/tags as JSON, pages table with parentSlug/published/sortOrder, subscribers.status) |
| 8 | `webapp` | Generate initial migration |
| 9 | `webapp` | Create Drizzle client factory + bindings types |
| 10 | `webapp` | Create `types/content.ts` (ContentBlock types) |
| 11 | `webapp` | Create `config/site.ts` (with feature toggles) + `config/navigation.ts` (with feature keys per link) |
| 12 | `webapp` | Create `lib/utils.ts`, `lib/turnstile.ts` |
| 13 | `webapp` | Create `lib/r2.ts` (upload validation: image types only, 5 MB max), `lib/queue.ts`, `lib/queue-consumer.ts`, `lib/resend.ts` |
| 14 | `webapp` | Create `lib/referral.ts` (code generation + atomic position calc) |
| 15 | `webapp` | Create `lib/waitlist.ts` (subscriber queries, atomic referral count increment, unsubscribe) |
| 16 | `webapp` | Create `lib/giveaway.ts` (entry + action queries, atomic totalEntries, end date check) |
| 17 | `webapp` | Create `lib/blog.ts` (related posts via `json_each` on tags), `lib/pages.ts` (system + content pages, child queries), `lib/contact.ts`, `lib/admin.ts` (session cleanup on login) |
| 18 | `webapp` | Create `lib/seo.ts` (SEO audit queries), `lib/search.ts` (LIKE search across posts + pages) |
| 19 | `webapp` | Build content block renderer + all block components |
| 20 | `webapp` | Create all API routes (waitlist, giveaway w/ end date enforcement, contact, blog, search, unsubscribe, admin incl. seo + pages CRUD) |
| 21 | `webapp` | Build shared: Turnstile component, JSON-LD component, search dialog (Cmd+K, cmdk) |
| 22 | `webapp` | Build Header + Breadcrumbs + Footer + mobile nav (feature-aware, config-driven) |
| 23 | `webapp` | Build FAQ section + related pages components |
| 24 | `webapp` | Build root layout with metadata |
| 25 | `webapp` | Build Landing page (hero, waitlist CTA + Turnstile, features, FAQs, related pages — sections conditional on feature toggles) |
| 26 | `webapp` | Build Waitlist signup page (duplicate email → redirect to dashboard) + referral dashboard (with FAQs, related pages) |
| 27 | `webapp` | Build Giveaway page (entry form + Turnstile, action cards, countdown, end date enforcement, FAQs, related pages) |
| 28 | `webapp` | Build Blog listing (paginated) + post pages (content blocks, publishedAt date, per-post FAQs, related posts via tags) |
| 29 | `webapp` | Build Contact page (form + Turnstile, FAQs, related pages) |
| 30 | `webapp` | Build Terms + Privacy pages (content blocks from pages table) |
| 31 | `webapp` | Build catch-all content page route (`[...slug]/page.tsx`) — queries D1, renders content blocks, child pages grid for pillars |
| 32 | `webapp` | Build Admin: login (with session cleanup + HttpOnly/Secure/SameSite cookie), dashboard, layout with sidebar (feature-aware) |
| 33 | `webapp` | Build Admin: block-based post editor (all block editors + FAQ editor + publishedAt handling) |
| 34 | `webapp` | Build Admin: post list, create, edit pages (with delete confirmation) |
| 35 | `webapp` | Build Admin: page editor with content blocks + parent selector + slug input (reuses block editor; supports both system and content pages) |
| 36 | `webapp` | Build Admin: page list with hierarchy (system pages section + content pages tree with drag-to-reorder) |
| 37 | `webapp` | Build Admin: create content page flow (slug validation against reserved list, parent selector) |
| 38 | `webapp` | Build Admin: subscribers list, giveaway list |
| 39 | `webapp` | Build Admin: image upload to R2 (validate type + 5 MB max) |
| 40 | `webapp` | Build Admin: SEO audit dashboard (content health across all pages + posts) |
| 41 | `webapp` | Create sitemap.ts + robots.ts (env-aware, feature-aware, includes content pages, uses ENVIRONMENT binding) |
| 42 | `webapp` | Create RSS feed (`feed.xml/route.ts`) — 20 most recent published posts |
| 43 | `webapp` | Create 404 page |
| 44 | `webapp` | Create seed data (7 system page rows incl. metadata + sample posts with content blocks + test subscribers) |
| 45 | `webapp` | Add `.env.example`, update `.gitignore` |
| 46 | `webapp` | Run local D1 migration + seed + test dev server |
| 47 | `webapp` | Test Cloudflare preview build |
| 48 | `webapp` | Verify feature toggles: disable each feature, confirm 404 + nav hidden + sitemap excluded |

---

## 14. Verification

1. **Landing page**: renders hero, features, waitlist CTA with Turnstile, live subscriber count, latest posts, FAQs, related pages — sections hide when corresponding feature toggle is off
2. **Breadcrumbs**: every public page shows correct breadcrumb trail, BreadcrumbList JSON-LD emitted
3. **FAQs**: every public page shows FAQ accordion (from D1 `pages` or `posts` table), FAQPage JSON-LD emitted
4. **Related pages**: every public page shows related page cards (from D1 `pages` table or auto-queried by tags)
5. **Waitlist signup**: Turnstile passes → creates subscriber with referral code, sends confirmation email, shows position; duplicate email redirects to existing dashboard
6. **Referral**: signing up with `?ref=abc123` atomically increments referrer's count, adjusts position using boost factor from `pages.metadata`
7. **Referral dashboard**: shows position, referral count, share link with social buttons
8. **Giveaway entry**: creates entry (or links to subscriber), tracks bonus actions, Turnstile on entry form; giveaway config (end date, prizes) from D1 `pages.metadata`; **rejects entries after end date** (410 GIVEAWAY_ENDED)
9. **Giveaway duplicate prevention**: same action cannot be submitted twice per entry (unique constraint); referral actions use `referral:{email}` format
10. **Giveaway atomic updates**: `totalEntries` incremented atomically in same transaction as action insert
11. **Blog listing**: paginated (12 per page), renders post cards from D1 with cover images from R2, shows `publishedAt` date
12. **Blog post**: content blocks render correctly (all 8 types), per-post FAQs, related posts via `json_each()` tag matching
13. **Contact**: Turnstile passes → stores in D1, queues email
14. **Legal pages**: `/terms` and `/privacy` render content blocks from D1 `pages.content`
15. **Queue consumer**: email jobs processed from queue, delivered via Resend, failures route to DLQ
16. **Email compliance**: all outbound emails include `List-Unsubscribe` header; unsubscribe endpoint sets `subscribers.status = "unsubscribed"`
17. **Admin login**: password auth with HttpOnly/Secure/SameSite=Strict session cookie; expired sessions cleaned up on login
18. **Admin posts**: create with block editor, edit, publish/unpublish (sets `publishedAt`), delete with confirmation, upload cover image to R2, edit per-post FAQs
19. **Admin block editor**: add/remove/reorder blocks, inline image upload (type + 5 MB validation), live preview
20. **Content pages**: catch-all route renders published content pages from D1; pillar pages show child page grid; breadcrumbs follow hierarchy; 404 for non-existent slugs
21. **Pillar pages**: creating a child page under a pillar auto-shows it in the parent's child grid, sorted by `sortOrder`
22. **Search (Cmd+K)**: opens search dialog, queries posts + pages, results grouped by type, keyboard navigation works, navigates to selected result
23. **Admin pages**: list shows system pages + content pages with hierarchy; edit all fields; create new content pages with parent selector
24. **Admin content pages**: create/edit/delete content pages; slug validation against reserved list; system pages cannot be deleted
25. **Admin SEO audit**: dashboard shows content health per page/post (title length, description length, FAQs count, OG image, tags, cover image)
26. **Admin data**: view subscriber list (with status) + giveaway entries
27. **API errors**: all routes return consistent `{ ok, data/error }` format with documented error codes
28. **Sitemap**: all enabled system pages + published content pages + blog posts, no admin pages; excludes disabled features
29. **RSS feed**: `/feed.xml` serves 20 most recent published posts; linked from `<head>` and robots.txt
30. **Robots**: UAT blocks, prod allows + sitemap + RSS links, both block `/admin`
31. **SEO**: Lighthouse 100 on all public pages
32. **Environments**: UAT and prod fully isolated (separate D1, R2, Queues), ENVIRONMENT var available at runtime
33. **Turnstile**: all public forms protected, test mode works locally
34. **Feature toggles**: disabling a feature hides nav links, returns 404 on routes, excludes from sitemap/RSS, hides admin sections

---

## 15. First-Time Setup

```bash
# ─── 1. Infrastructure ────────────────────────────────────────
cd /Users/devsoul/Workspace/woi/webapp-tf
terraform workspace new uat && terraform workspace new prod

terraform workspace select uat
cp envs/example.tfvars envs/uat.tfvars    # fill in values
terraform init && terraform apply -var-file="envs/uat.tfvars"

terraform workspace select prod
cp envs/example.tfvars envs/prod.tfvars   # fill in values
terraform apply -var-file="envs/prod.tfvars"

# ─── 2. Paste D1 IDs into webapp/wrangler.jsonc ──────────────

# ─── 3. Create queues ────────────────────────────────────────
cd /Users/devsoul/Workspace/woi/webapp
wrangler queues create webapp-uat-email-queue
wrangler queues create webapp-uat-email-dlq
wrangler queues create webapp-prod-email-queue
wrangler queues create webapp-prod-email-dlq

# ─── 4. Local development ────────────────────────────────────
npm install
npm run db:generate
npm run db:migrate:local
npm run db:seed:local
npm run dev

# ─── 5. Deploy UAT ───────────────────────────────────────────
npm run db:migrate:uat
npm run deploy:uat
wrangler secret put SITE_URL --env uat
wrangler secret put R2_PUBLIC_URL --env uat
wrangler secret put RESEND_API_KEY --env uat
wrangler secret put FROM_EMAIL --env uat
wrangler secret put CONTACT_EMAIL --env uat
wrangler secret put ADMIN_PASSWORD --env uat
wrangler secret put TURNSTILE_SECRET_KEY --env uat

# ─── 6. Deploy Production ────────────────────────────────────
git checkout release
npm run db:migrate:prod
npm run deploy:prod
wrangler secret put SITE_URL --env prod
wrangler secret put R2_PUBLIC_URL --env prod
wrangler secret put RESEND_API_KEY --env prod
wrangler secret put FROM_EMAIL --env prod
wrangler secret put CONTACT_EMAIL --env prod
wrangler secret put ADMIN_PASSWORD --env prod
wrangler secret put TURNSTILE_SECRET_KEY --env prod
```
