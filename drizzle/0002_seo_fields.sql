ALTER TABLE `posts` ADD `seo_title` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `seo_description` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `seo_keywords` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `og_image` text;--> statement-breakpoint
ALTER TABLE `profile` ADD `seo_keywords` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `profile` ADD `alternate_names` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `profile` ADD `og_image` text;--> statement-breakpoint
ALTER TABLE `profile` ADD `twitter_handle` text;--> statement-breakpoint
ALTER TABLE `profile` ADD `google_verification` text;--> statement-breakpoint
ALTER TABLE `profile` ADD `bing_verification` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `seo_title` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `seo_description` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `seo_keywords` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `og_image` text;