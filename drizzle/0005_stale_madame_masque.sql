CREATE TABLE `user_product_actions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`product_id` integer NOT NULL,
	`action` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_product_actions_unique` ON `user_product_actions` (`user_email`,`product_id`,`action`);--> statement-breakpoint
CREATE INDEX `user_product_actions_user_idx` ON `user_product_actions` (`user_email`,`action`);