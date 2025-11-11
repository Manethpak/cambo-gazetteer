CREATE TABLE `administrative_units` (
	`code` text PRIMARY KEY NOT NULL,
	`name_km` text NOT NULL,
	`name_en` text NOT NULL,
	`type` text NOT NULL,
	`parent_code` text,
	`reference` text,
	`official_note` text,
	`checker_note` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`parent_code`) REFERENCES `administrative_units`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `type_idx` ON `administrative_units` (`type`);--> statement-breakpoint
CREATE INDEX `parent_code_idx` ON `administrative_units` (`parent_code`);--> statement-breakpoint
CREATE INDEX `type_parent_idx` ON `administrative_units` (`type`,`parent_code`);--> statement-breakpoint
CREATE INDEX `name_en_idx` ON `administrative_units` (`name_en`);--> statement-breakpoint
CREATE INDEX `name_km_idx` ON `administrative_units` (`name_km`);