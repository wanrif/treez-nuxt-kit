ALTER TABLE `sessions` ADD `token` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;