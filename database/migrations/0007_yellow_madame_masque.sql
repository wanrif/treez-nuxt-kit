CREATE TABLE `twoFactor` (
	`id` varchar(32) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`secret` varchar(255) NOT NULL,
	`backupCodes` varchar(255) NOT NULL,
	`created_at` varchar(255),
	`updated_at` varchar(255),
	CONSTRAINT `twoFactor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorEnabled` int unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `secret` ON `twoFactor` (`secret`);