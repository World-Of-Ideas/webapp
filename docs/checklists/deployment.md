# Checklist: Deployment

## Pre-Deploy

- [ ] All tests pass locally
- [ ] No TypeScript errors: `npm run check`
- [ ] No lint errors: `npm run lint`
- [ ] If schema changed: migration generated (`npm run db:generate`) and committed

## Deploy to UAT

```bash
cd /Users/devsoul/Workspace/woi/webapp
git checkout main
```

- [ ] Apply DB migrations (if any): `npm run db:migrate:uat`
- [ ] Deploy: `npm run deploy:uat`
- [ ] Set any new secrets: `wrangler secret put KEY --env uat`
- [ ] Verify at `https://uat.example.com`:
  - [ ] Landing page loads with hero, features, adaptive CTA, latest posts
  - [ ] Breadcrumbs render on all public pages
  - [ ] FAQs accordion renders on pages with FAQ data
  - [ ] Related pages section renders
  - [ ] Waitlist signup works (creates subscriber, shows referral dashboard)
  - [ ] Duplicate email redirects to existing dashboard
  - [ ] Giveaway entry works (if enabled), rejects after end date
  - [ ] Blog listing loads with pagination
  - [ ] Blog post renders content blocks correctly
  - [ ] Contact form submits successfully
  - [ ] Terms and Privacy pages render content blocks
  - [ ] Turnstile appears on all public forms
  - [ ] Admin login works, session cookie is HttpOnly/Secure
  - [ ] Admin post editor creates/edits posts with block editor
  - [ ] Admin SEO audit dashboard shows correct data
  - [ ] Sitemap accessible at `/sitemap.xml` (excludes disabled features + admin)
  - [ ] RSS feed accessible at `/feed.xml`
  - [ ] Robots.txt returns `Disallow: /`
  - [ ] Feature toggles: disabled features return 404 + hidden from nav

## Deploy to Production

```bash
cd /Users/devsoul/Workspace/woi/webapp
git checkout release
git merge main
```

- [ ] Apply DB migrations (if any): `npm run db:migrate:prod`
- [ ] Deploy: `npm run deploy:prod`
- [ ] Set any new secrets: `wrangler secret put KEY --env prod`
- [ ] Verify at `https://www.example.com`:
  - [ ] All pages load correctly
  - [ ] Waitlist signup + referral flow works end-to-end
  - [ ] Blog posts render from D1 with cover images from R2
  - [ ] Contact form submits and queues email
  - [ ] Admin panel accessible and functional
  - [ ] Sitemap accessible at `/sitemap.xml` with all public pages
  - [ ] RSS feed accessible at `/feed.xml`
  - [ ] Robots.txt returns `Allow: /` with sitemap + RSS links, blocks `/admin`
  - [ ] Run Lighthouse — confirm 100 SEO score
  - [ ] Emails include List-Unsubscribe header

## Rollback

If something goes wrong:

```bash
# Redeploy previous version
git checkout release~1
npm run deploy:prod

# Or revert and redeploy
git revert HEAD
git push
npm run deploy:prod
```

D1 migrations cannot be easily rolled back. If a migration caused issues, create a new migration that reverses the changes.
