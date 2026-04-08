-- Create global permissions catalog table
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_slug_unique" ON "permissions" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX "permissions_is_active_idx" ON "permissions" USING btree ("is_active");
--> statement-breakpoint

-- Seed the 9 built-in permissions with stable UUIDs (idempotent)
INSERT INTO "permissions" ("id", "name", "slug", "is_active", "created_at", "updated_at") VALUES
  ('20000000-0000-0000-0000-000000000001', 'Pharmacy',     'pharmacy',     true, now(), now()),
  ('20000000-0000-0000-0000-000000000002', 'OPD',          'opd',          true, now(), now()),
  ('20000000-0000-0000-0000-000000000003', 'IPD',          'ipd',          true, now(), now()),
  ('20000000-0000-0000-0000-000000000004', 'Appointments', 'appointments', true, now(), now()),
  ('20000000-0000-0000-0000-000000000005', 'Laboratory',   'laboratory',   true, now(), now()),
  ('20000000-0000-0000-0000-000000000006', 'Radiology',    'radiology',    true, now(), now()),
  ('20000000-0000-0000-0000-000000000007', 'Inventory',    'inventory',    true, now(), now()),
  ('20000000-0000-0000-0000-000000000008', 'Billing',      'billing',      true, now(), now()),
  ('20000000-0000-0000-0000-000000000009', 'Reports',      'reports',      true, now(), now())
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint

-- Add permission_id as nullable first (needed before data migration)
ALTER TABLE "organization_permissions" ADD COLUMN "permission_id" uuid;
--> statement-breakpoint

-- Backfill permission_id from the old feature enum value
UPDATE "organization_permissions" op
SET "permission_id" = p."id"
FROM "permissions" p
WHERE p."slug" = op."feature"::text;
--> statement-breakpoint

-- Now make permission_id NOT NULL and add FK constraint
ALTER TABLE "organization_permissions" ALTER COLUMN "permission_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "organization_permissions" ADD CONSTRAINT "organization_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Drop old index that used feature column
DROP INDEX "org_permissions_org_feature_unique";
--> statement-breakpoint

-- Drop feature column
ALTER TABLE "organization_permissions" DROP COLUMN "feature";
--> statement-breakpoint

-- Drop org_feature enum type (no longer used)
DROP TYPE "public"."org_feature";
--> statement-breakpoint

-- Create new unique index on (organization_id, permission_id)
CREATE UNIQUE INDEX "org_permissions_org_permission_unique" ON "organization_permissions" USING btree ("organization_id","permission_id");
--> statement-breakpoint
CREATE INDEX "org_permissions_permission_id_idx" ON "organization_permissions" USING btree ("permission_id");
