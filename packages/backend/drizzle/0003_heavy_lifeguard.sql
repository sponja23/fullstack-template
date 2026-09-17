ALTER TABLE "time_entry" DROP CONSTRAINT "time_entry_author_id_member_id_fk";
--> statement-breakpoint
UPDATE "time_entry"
SET "author_id" = "member"."user_id"
FROM "member"
WHERE "time_entry"."author_id" = "member"."id";
--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "line_item" ADD CONSTRAINT "line_item_arithmetic_valid" CHECK (("line_item"."kind" = 'manual' and "line_item"."total_minor" = "line_item"."quantity" * "line_item"."unit_amount_minor") or ("line_item"."kind" = 'generated' and "line_item"."total_minor" = round("line_item"."quantity"::numeric * "line_item"."unit_amount_minor" / 60)));
