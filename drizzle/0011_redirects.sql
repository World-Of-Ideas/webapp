CREATE TABLE `redirects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_path` text NOT NULL,
	`to_url` text NOT NULL,
	`status_code` integer NOT NULL DEFAULT 301,
	`enabled` integer NOT NULL DEFAULT 1,
	`created_at` text NOT NULL DEFAULT (datetime('now')),
	`updated_at` text NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX `redirects_from_path_unique` ON `redirects` (`from_path`);
CREATE INDEX `idx_redirects_from` ON `redirects` (`from_path`);
