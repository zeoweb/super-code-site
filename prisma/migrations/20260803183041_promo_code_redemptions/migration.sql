-- AlterTable
ALTER TABLE "promo_codes" ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "promo_code_redemptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "promo_code_id" TEXT NOT NULL,
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_code_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promo_code_redemptions_user_id_promo_code_id_key" ON "promo_code_redemptions"("user_id", "promo_code_id");

-- AddForeignKey
ALTER TABLE "promo_code_redemptions" ADD CONSTRAINT "promo_code_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_code_redemptions" ADD CONSTRAINT "promo_code_redemptions_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
