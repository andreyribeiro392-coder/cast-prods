PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`audience` text NOT NULL,
	`age_group` text DEFAULT 'geral' NOT NULL,
	`department` text DEFAULT 'moda' NOT NULL,
	`category` text NOT NULL,
	`source_item_id` text,
	`product_url` text NOT NULL,
	`image_key` text,
	`image_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "title", "description", "audience", "age_group", "department", "category", "source_item_id", "product_url", "image_key", "image_url", "created_at") SELECT "id", "title", "description", "audience", "age_group", "department", "category", "source_item_id", "product_url", "image_key", "image_url", "created_at" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `products_source_item_id_unique` ON `products` (`source_item_id`);
--> statement-breakpoint
-- Produtos gerais não devem receber o rótulo "Adulto".
UPDATE `products`
SET `age_group` = 'geral'
WHERE `age_group` = 'adulto'
  AND `department` NOT IN ('moda', 'acessorios');
--> statement-breakpoint
-- Correções de departamento e categoria encontradas na auditoria completa.
UPDATE `products` SET `category` = 'pijamas' WHERE `id` = 5;
--> statement-breakpoint
UPDATE `products` SET `department` = 'moda', `category` = 'shorts' WHERE `id` IN (77, 102);
--> statement-breakpoint
UPDATE `products` SET `department` = 'acessorios', `category` = 'aneis' WHERE `id` = 114;
--> statement-breakpoint
UPDATE `products` SET `department` = 'acessorios', `category` = 'brincos' WHERE `id` = 168;
--> statement-breakpoint
UPDATE `products` SET `category` = 'cintos' WHERE `id` = 187;
--> statement-breakpoint
UPDATE `products` SET `department` = 'acessorios', `category` = 'oculos' WHERE `id` = 289;
--> statement-breakpoint
UPDATE `products` SET `department` = 'acessorios', `category` = 'aneis' WHERE `id` = 339;
--> statement-breakpoint
UPDATE `products` SET `age_group` = 'geral', `category` = 'teclados' WHERE `id` IN (423, 434);
--> statement-breakpoint
UPDATE `products` SET `department` = 'tecnologia', `category` = 'audio' WHERE `id` = 449;
--> statement-breakpoint
UPDATE `products` SET `department` = 'moda', `category` = 'moletons' WHERE `id` = 464;
--> statement-breakpoint
UPDATE `products` SET `department` = 'moda', `category` = 'calcas' WHERE `id` = 469;
--> statement-breakpoint
UPDATE `products` SET `department` = 'tecnologia', `category` = 'audio', `age_group` = 'geral' WHERE `id` = 511;
--> statement-breakpoint
UPDATE `products` SET `department` = 'beleza', `category` = 'higiene', `age_group` = 'geral' WHERE `id` = 521;
--> statement-breakpoint
UPDATE `products` SET `department` = 'academia', `category` = 'sapatos', `audience` = 'unissex', `age_group` = 'geral' WHERE `id` = 563;
--> statement-breakpoint
-- Correções de público: itens claramente masculinos, femininos ou realmente unissex.
UPDATE `products` SET `audience` = 'masculino' WHERE `id` IN (72, 706, 721, 725, 796);
--> statement-breakpoint
UPDATE `products` SET `audience` = 'feminino' WHERE `id` IN (446, 462, 467, 493, 578, 583, 614, 619, 809);
--> statement-breakpoint
UPDATE `products` SET `audience` = 'unissex' WHERE `id` IN (175, 183, 297, 302, 333);
