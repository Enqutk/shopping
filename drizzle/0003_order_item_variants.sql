ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "color" varchar(64);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "size" varchar(32);
