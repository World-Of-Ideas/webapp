-- Add ON DELETE behavior to giveaway foreign keys.
-- SQLite doesn't support ALTER TABLE to modify FK constraints,
-- so we recreate the tables with the correct constraints.

-- Step 1: Recreate giveaway_actions with ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS `giveaway_actions_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL REFERENCES `giveaway_entries`(`id`) ON DELETE CASCADE,
	`action` text NOT NULL,
	`bonus_entries` integer NOT NULL,
	`metadata` text,
	`completed_at` text NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO `giveaway_actions_new` SELECT * FROM `giveaway_actions`;
DROP TABLE IF EXISTS `giveaway_actions`;
ALTER TABLE `giveaway_actions_new` RENAME TO `giveaway_actions`;
CREATE UNIQUE INDEX IF NOT EXISTS `uq_entry_action` ON `giveaway_actions` (`entry_id`, `action`);
CREATE INDEX IF NOT EXISTS `idx_actions_entry` ON `giveaway_actions` (`entry_id`);

-- Step 2: Recreate giveaway_entries with ON DELETE SET NULL for subscriber_id
CREATE TABLE IF NOT EXISTS `giveaway_entries_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`subscriber_id` integer REFERENCES `subscribers`(`id`) ON DELETE SET NULL,
	`total_entries` integer NOT NULL DEFAULT 1,
	`source` text,
	`created_at` text NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO `giveaway_entries_new` SELECT * FROM `giveaway_entries`;
DROP TABLE IF EXISTS `giveaway_entries`;
ALTER TABLE `giveaway_entries_new` RENAME TO `giveaway_entries`;
CREATE UNIQUE INDEX IF NOT EXISTS `giveaway_entries_email_unique` ON `giveaway_entries` (`email`);
