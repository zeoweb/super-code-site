-- CreateEnum
CREATE TYPE "QuizDifficulty" AS ENUM ('novice', 'medium', 'pro');

-- AlterTable
ALTER TABLE "ai_chat_messages" ADD COLUMN     "lesson_id" TEXT;

-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN     "difficulty" "QuizDifficulty" NOT NULL DEFAULT 'novice';

-- AlterTable
ALTER TABLE "quiz_questions" ADD COLUMN     "difficulty" "QuizDifficulty" NOT NULL DEFAULT 'novice';

-- CreateIndex
CREATE INDEX "ai_chat_messages_lesson_id_idx" ON "ai_chat_messages"("lesson_id");

-- CreateIndex
CREATE INDEX "quiz_questions_difficulty_idx" ON "quiz_questions"("difficulty");

-- AddForeignKey
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
