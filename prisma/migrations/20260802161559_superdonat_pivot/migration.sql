/*
  Warnings:

  - You are about to drop the column `tier` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `ai_chat_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `broadcasts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `community_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lesson_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lessons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quizzes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PackageKind" AS ENUM ('currency', 'pass', 'voucher');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'completed', 'rejected');

-- CreateEnum
CREATE TYPE "BalanceTxReason" AS ENUM ('topup', 'order', 'referral', 'admin', 'promo');

-- DropForeignKey
ALTER TABLE "ai_chat_messages" DROP CONSTRAINT "ai_chat_messages_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_chat_messages" DROP CONSTRAINT "ai_chat_messages_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_chat_messages" DROP CONSTRAINT "ai_chat_messages_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_conversations" DROP CONSTRAINT "ai_conversations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "community_messages" DROP CONSTRAINT "community_messages_user_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lesson_progress_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lesson_progress_user_id_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_module_id_fkey";

-- DropForeignKey
ALTER TABLE "modules" DROP CONSTRAINT "modules_course_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_questions" DROP CONSTRAINT "quiz_questions_quiz_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "tier",
DROP COLUMN "xp",
ADD COLUMN     "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "referred_by_id" TEXT;

-- DropTable
DROP TABLE "ai_chat_messages";

-- DropTable
DROP TABLE "ai_conversations";

-- DropTable
DROP TABLE "broadcasts";

-- DropTable
DROP TABLE "community_messages";

-- DropTable
DROP TABLE "courses";

-- DropTable
DROP TABLE "lesson_progress";

-- DropTable
DROP TABLE "lessons";

-- DropTable
DROP TABLE "modules";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "quiz_attempts";

-- DropTable
DROP TABLE "quiz_questions";

-- DropTable
DROP TABLE "quizzes";

-- DropTable
DROP TABLE "reviews";

-- DropEnum
DROP TYPE "QuizDifficulty";

-- DropEnum
DROP TYPE "RequiredTier";

-- DropEnum
DROP TYPE "Tier";

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "region" TEXT,
    "kind" "PackageKind" NOT NULL DEFAULT 'currency',
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "game_identifier" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "admin_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topups" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method_id" TEXT,
    "receipt_screenshot_url" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "admin_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "topups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" "BalanceTxReason" NOT NULL,
    "ref_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- CreateIndex
CREATE INDEX "packages_game_id_idx" ON "packages"("game_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "topups_status_idx" ON "topups"("status");

-- CreateIndex
CREATE INDEX "balance_transactions_user_id_idx" ON "balance_transactions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topups" ADD CONSTRAINT "topups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topups" ADD CONSTRAINT "topups_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
