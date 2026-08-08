-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "popup_dismissed_at" TIMESTAMP(3),
ADD COLUMN     "show_as_popup" BOOLEAN NOT NULL DEFAULT false;

