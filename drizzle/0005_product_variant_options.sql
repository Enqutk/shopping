ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "available_colors" jsonb;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "available_sizes" jsonb;
