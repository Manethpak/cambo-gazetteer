CREATE INDEX `type_code_idx` ON `administrative_units` (`type`,`code`);--> statement-breakpoint
CREATE INDEX `type_parent_code_idx` ON `administrative_units` (`type`,`parent_code`,`code`);
--> statement-breakpoint
PRAGMA optimize;
