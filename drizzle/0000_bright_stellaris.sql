CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_expires` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `giveaway_actions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL,
	`action` text NOT NULL,
	`bonus_entries` integer NOT NULL,
	`metadata` text,
	`completed_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `giveaway_entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_entry_action` ON `giveaway_actions` (`entry_id`,`action`);--> statement-breakpoint
CREATE INDEX `idx_actions_entry` ON `giveaway_actions` (`entry_id`);--> statement-breakpoint
CREATE TABLE `giveaway_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`subscriber_id` integer,
	`total_entries` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `giveaway_entries_email_unique` ON `giveaway_entries` (`email`);--> statement-breakpoint
CREATE TABLE `pages` (
	`slug` text PRIMARY KEY NOT NULL,
	`parent_slug` text,
	`title` text NOT NULL,
	`description` text,
	`content` text,
	`faqs` text,
	`related_pages` text,
	`cover_image` text,
	`metadata` text,
	`published` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_pages_parent` ON `pages` (`parent_slug`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`faqs` text,
	`cover_image` text,
	`author` text DEFAULT 'Admin' NOT NULL,
	`tags` text,
	`published` integer DEFAULT false NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_posts_listing` ON `posts` (`published`,`created_at`);--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`referral_code` text NOT NULL,
	`referred_by` text,
	`referral_count` integer DEFAULT 0 NOT NULL,
	`position` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_referral_code_unique` ON `subscribers` (`referral_code`);