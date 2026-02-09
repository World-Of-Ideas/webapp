ALTER TABLE `tracking_settings` ADD `ga_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tracking_settings` ADD `ga_measurement_id` text;--> statement-breakpoint
ALTER TABLE `tracking_settings` ADD `ga_mp_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tracking_settings` ADD `ga_mp_api_secret` text;