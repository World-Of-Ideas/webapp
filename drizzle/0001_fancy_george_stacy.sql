CREATE TABLE `tracking_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`meta_pixel_enabled` integer DEFAULT false NOT NULL,
	`meta_pixel_id` text,
	`meta_capi_enabled` integer DEFAULT false NOT NULL,
	`meta_capi_token` text,
	`utm_tracking_enabled` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `source` text;--> statement-breakpoint
ALTER TABLE `giveaway_entries` ADD `source` text;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `source` text;