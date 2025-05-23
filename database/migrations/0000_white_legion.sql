CREATE TABLE `accounts` (
	`id` varchar(32) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`access_token` varchar(255),
	`refresh_token` varchar(255),
	`id_token` varchar(255),
	`access_token_expires_at` varchar(255),
	`refresh_token_expires_at` varchar(255),
	`password` varchar(255) NOT NULL,
	`created_at` varchar(255),
	`updated_at` varchar(255),
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(32) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` int unsigned NOT NULL DEFAULT 0,
	`phone` varchar(15),
	`location` varchar(255),
	`website` varchar(255),
	`bio` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`role` varchar(255) DEFAULT 'user',
	`banned` int unsigned NOT NULL DEFAULT 0,
	`banReason` varchar(255),
	`banExpires` timestamp,
	`twoFactorEnabled` int unsigned NOT NULL DEFAULT 0,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(32) NOT NULL,
	`token` varchar(255) NOT NULL,
	`ip_address` varchar(45) NOT NULL,
	`user_agent` varchar(512) NOT NULL,
	`user_id` varchar(32) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`impersonatedBy` varchar(32),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` varchar(32) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`expires_at` varchar(255),
	`created_at` varchar(255),
	`updated_at` varchar(255),
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `twoFactor` (
	`id` varchar(32) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`secret` varchar(255) NOT NULL,
	`backupCodes` text NOT NULL,
	`created_at` varchar(255),
	`updated_at` varchar(255),
	CONSTRAINT `twoFactor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `identifier_idx` ON `verifications` (`identifier`);--> statement-breakpoint
CREATE INDEX `secret` ON `twoFactor` (`secret`);