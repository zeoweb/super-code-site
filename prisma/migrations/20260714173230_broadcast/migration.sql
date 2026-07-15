-- CreateTable
CREATE TABLE "broadcasts" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "audience" "Tier",
    "recipient_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcasts_pkey" PRIMARY KEY ("id")
);
