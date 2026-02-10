-- Audit round 2: add index on posts.publishedAt for blog listing sort
CREATE INDEX IF NOT EXISTS "idx_posts_published_at" ON "posts" ("published_at");
