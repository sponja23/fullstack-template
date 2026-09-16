CREATE TABLE "invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"client_id" text NOT NULL,
	"currency" text NOT NULL,
	"number" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"issued_at" timestamp,
	"paid_at" timestamp,
	"voided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_counter" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"next" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "line_item" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"project_id" text,
	"kind" text NOT NULL,
	"description" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_amount_minor" integer NOT NULL,
	"total_minor" integer NOT NULL,
	"source_entry_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "line_item_quantity_positive" CHECK ("line_item"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_counter" ADD CONSTRAINT "invoice_counter_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "line_item" ADD CONSTRAINT "line_item_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "line_item" ADD CONSTRAINT "line_item_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_organization_number_unique" ON "invoice" USING btree ("organization_id","number") WHERE "invoice"."number" is not null;--> statement-breakpoint
CREATE INDEX "invoice_organization_idx" ON "invoice" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invoice_client_idx" ON "invoice" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "line_item_invoice_idx" ON "line_item" USING btree ("invoice_id");--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_line_item_id_line_item_id_fk" FOREIGN KEY ("line_item_id") REFERENCES "public"."line_item"("id") ON DELETE restrict ON UPDATE no action;