ALTER TABLE `site_settings` ADD COLUMN `announcement` text DEFAULT '{"enabled":false,"text":"","linkUrl":"","linkText":""}' NOT NULL;
