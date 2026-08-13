-- Remove produtos domésticos e infantis das categorias de setup/PC.
UPDATE products SET department = 'casa', category = 'casa_utilidades', age_group = 'geral'
WHERE id IN (403, 409, 414, 417, 418, 668);
--> statement-breakpoint
UPDATE products SET department = 'acessorios', category = 'acessorios', age_group = 'infantil'
WHERE id = 449;
--> statement-breakpoint
UPDATE products SET department = 'acessorios', category = 'relogios', age_group = 'adulto'
WHERE id IN (742, 777);
--> statement-breakpoint
UPDATE products SET department = 'tecnologia', category = 'perifericos', age_group = 'geral'
WHERE id = 407;
