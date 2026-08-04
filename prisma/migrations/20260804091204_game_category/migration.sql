-- CreateEnum
CREATE TYPE "GameCategory" AS ENUM ('game', 'service', 'software');

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "category" "GameCategory" NOT NULL DEFAULT 'game';
