-- AlterEnum
ALTER TYPE "BalanceTxReason" ADD VALUE 'refund';

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'failed';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "auto_order_error" TEXT,
ADD COLUMN     "external_order_id" TEXT;

-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "external_offer_id" TEXT;

-- CreateTable
CREATE TABLE "app_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "usd_to_tjs_rate" DECIMAL(6,4) NOT NULL DEFAULT 9.22,
    "fazercards_margin_max" DECIMAL(4,2) NOT NULL DEFAULT 0.85,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

