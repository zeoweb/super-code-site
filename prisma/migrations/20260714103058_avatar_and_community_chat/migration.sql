-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_url" TEXT;

-- CreateTable
CREATE TABLE "community_messages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT,
    "media_url" TEXT,
    "media_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_messages_created_at_idx" ON "community_messages"("created_at");

-- AddForeignKey
ALTER TABLE "community_messages" ADD CONSTRAINT "community_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
