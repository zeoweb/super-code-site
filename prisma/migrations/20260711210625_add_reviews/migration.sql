-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "student_name" TEXT NOT NULL,
    "student_role" TEXT,
    "video_url" TEXT,
    "quote_text" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_is_published_idx" ON "reviews"("is_published");
