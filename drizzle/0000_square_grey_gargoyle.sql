CREATE TYPE "public"."cabin_privacy" AS ENUM('private_cabin', 'curtain', 'open', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."channel" AS ENUM('google_ads', 'justdial', 'instagram', 'referral', 'walk_in', 'other');--> statement-breakpoint
CREATE TYPE "public"."supplier_country" AS ENUM('india', 'china');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'replied', 'consulted', 'installed', 'lost');--> statement-breakpoint
CREATE TYPE "public"."upsell_pressure" AS ENUM('none', 'low', 'medium', 'high', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."sample_verdict" AS ENUM('pending', 'pass', 'fail', 'reorder');--> statement-breakpoint
CREATE TABLE "campaign_days" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "campaign_days_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"campaign_id" integer NOT NULL,
	"day" date NOT NULL,
	"spend" integer DEFAULT 0 NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "campaigns_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"channel" "channel" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"budget" integer DEFAULT 0 NOT NULL,
	"target_enquiries" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_visits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "competitor_visits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"competitor_id" integer NOT NULL,
	"visited_on" date NOT NULL,
	"visited_by" text,
	"install_price_min" integer,
	"install_price_max" integer,
	"maintenance_price" integer,
	"bases_offered" text,
	"cabin_privacy" "cabin_privacy" DEFAULT 'unknown' NOT NULL,
	"upsell_pressure" "upsell_pressure" DEFAULT 'unknown' NOT NULL,
	"products_used" text,
	"lead_time_days" integer,
	"packages" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "competitors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"area" text,
	"phone" text,
	"rating" numeric(2, 1),
	"reviews" integer,
	"note" text,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "leads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"campaign_id" integer,
	"name" text,
	"phone" text NOT NULL,
	"area" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"first_contact_at" timestamp with time zone DEFAULT now() NOT NULL,
	"next_follow_up" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_samples" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "supplier_samples_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"supplier_id" integer NOT NULL,
	"item" text NOT NULL,
	"spec" text,
	"ordered_on" date,
	"received_on" date,
	"landed_cost" integer,
	"wear_test_days" integer,
	"verdict" "sample_verdict" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "suppliers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"country" "supplier_country" NOT NULL,
	"city" text,
	"product" text,
	"price_note" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaign_days" ADD CONSTRAINT "campaign_days_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_visits" ADD CONSTRAINT "competitor_visits_competitor_id_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_samples" ADD CONSTRAINT "supplier_samples_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_days_campaign_day" ON "campaign_days" USING btree ("campaign_id","day");--> statement-breakpoint
CREATE UNIQUE INDEX "competitors_name" ON "competitors" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_name" ON "suppliers" USING btree ("name");