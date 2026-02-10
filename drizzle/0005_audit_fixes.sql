-- Audit fixes: add missing indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_subscribers_status" ON "subscribers" ("status");
CREATE INDEX IF NOT EXISTS "idx_subscribers_position" ON "subscribers" ("position");
CREATE INDEX IF NOT EXISTS "idx_contact_created" ON "contact_submissions" ("created_at");
