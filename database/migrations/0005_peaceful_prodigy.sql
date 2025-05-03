DROP INDEX `phone_idx` ON `users`;--> statement-breakpoint
DROP INDEX `ip_address_idx` ON `sessions`;--> statement-breakpoint
ALTER TABLE `users` ADD `role` varchar(255) DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `banned` int unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `banReason` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `ban_expires` timestamp;--> statement-breakpoint
ALTER TABLE `sessions` ADD `impersonatedBy` varchar(32);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `identifier_idx` ON `verifications` (`identifier`);