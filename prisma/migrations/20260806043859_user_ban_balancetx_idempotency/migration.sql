-- AlterTable
ALTER TABLE "balance_transactions" ADD COLUMN     "idempotency_key" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_banned" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "balance_transactions_idempotency_key_key" ON "balance_transactions"("idempotency_key");
