CREATE TABLE IF NOT EXISTS "order_status_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"status" "order_status" NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
