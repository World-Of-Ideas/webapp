CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`name` text DEFAULT 'Product Name' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`author` text DEFAULT '' NOT NULL,
	`social` text DEFAULT '{}' NOT NULL,
	`product_links` text DEFAULT '{}' NOT NULL,
	`features` text DEFAULT '{"waitlist":true,"giveaway":true,"blog":true,"contact":true}' NOT NULL,
	`ui` text DEFAULT '{"search":true,"themeToggle":true}' NOT NULL,
	`theme` text DEFAULT '{"preset":"bold","accentColor":"#9747ff","borderRadius":"0.625rem","headingWeight":"400","fontFamily":"inter","heroVariant":"gradient","headerVariant":"blur","footerVariant":"simple","postCardVariant":"bordered","ctaSectionVariant":"gradient"}' NOT NULL,
	`logo_url` text,
	`updated_at` text DEFAULT (datetime('now'))
);
