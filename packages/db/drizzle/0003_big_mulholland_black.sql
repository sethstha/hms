CREATE TYPE "public"."org_feature" AS ENUM('pharmacy', 'opd', 'ipd', 'appointments', 'laboratory', 'radiology', 'inventory', 'billing', 'reports');--> statement-breakpoint
CREATE TABLE "organization_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"feature" "org_feature" NOT NULL,
	"granted_by" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_memberships_no_superadmin" CHECK (role <> 'superadmin')
);
--> statement-breakpoint
ALTER TABLE "tenants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_tenant_id_tenants_id_fk";--> statement-breakpoint
ALTER TABLE "patients" DROP CONSTRAINT IF EXISTS "patients_tenant_id_tenants_id_fk";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_tenant_id_tenants_id_fk";--> statement-breakpoint
DROP TABLE "tenants" CASCADE;--> statement-breakpoint
ALTER TABLE "patients" RENAME COLUMN "tenant_id" TO "organization_id";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_tenant_scope_check";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_organization_id_organizations_id_fk";
--> statement-breakpoint
DROP INDEX "appointments_tenant_id_idx";--> statement-breakpoint
DROP INDEX "patients_tenant_uhid_unique";--> statement-breakpoint
DROP INDEX "patients_tenant_id_idx";--> statement-breakpoint
DROP INDEX "users_tenant_id_idx";--> statement-breakpoint
DROP INDEX "users_organization_id_idx";--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "domain" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_permissions" ADD CONSTRAINT "organization_permissions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_permissions" ADD CONSTRAINT "organization_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "org_permissions_org_feature_unique" ON "organization_permissions" USING btree ("organization_id","feature");--> statement-breakpoint
CREATE INDEX "org_permissions_org_id_idx" ON "organization_permissions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_permissions_granted_by_idx" ON "organization_permissions" USING btree ("granted_by");--> statement-breakpoint
CREATE UNIQUE INDEX "user_memberships_user_org_unique" ON "user_memberships" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "user_memberships_user_id_idx" ON "user_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_memberships_org_id_idx" ON "user_memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "user_memberships_is_active_idx" ON "user_memberships" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_org_id_idx" ON "appointments" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_domain_unique" ON "organizations" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "organizations_is_active_idx" ON "organizations" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "patients_org_uhid_unique" ON "patients" USING btree ("organization_id","uhid");--> statement-breakpoint
CREATE INDEX "patients_org_id_idx" ON "patients" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "organization_id";