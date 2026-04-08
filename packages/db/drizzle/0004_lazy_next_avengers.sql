ALTER TABLE "organization_permissions" ADD COLUMN "can_create" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_permissions" ADD COLUMN "can_read" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_permissions" ADD COLUMN "can_update" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_permissions" ADD COLUMN "can_delete" boolean DEFAULT true NOT NULL;