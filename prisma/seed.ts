/**
 * Наполнение базы демо-данными.
 * Запуск:  npm run db:seed
 *
 * Создаёт:
 *  - админа (email: admin@supercode.tj / пароль: admin12345)
 *  - демо-ученика (student@supercode.tj / student12345)
 *  - курс «Super Code» с модулями и уроками
 *  - способ оплаты (банк)
 */
import { PrismaClient, Tier, RequiredTier, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  // --- Пользователи ---
  const adminPass = await bcrypt.hash("admin12345", 10);
  const studentPass = await bcrypt.hash("student12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@supercode.tj" },
    update: {},
    create: {
      name: "Администратор",
      email: "admin@supercode.tj",
      phone: "+992900000000",
      passwordHash: adminPass,
      role: Role.admin,
      tier: Tier.pro,
    },
  });

  await prisma.user.upsert({
    where: { email: "student@supercode.tj" },
    update: {},
    create: {
      name: "Демо Ученик",
      email: "student@supercode.tj",
      phone: "+992900000001",
      passwordHash: studentPass,
      role: Role.student,
      tier: Tier.none,
    },
  });

  // --- Курс ---
  const course = await prisma.course.upsert({
    where: { slug: "super-code" },
    update: {},
    create: {
      title: "Super Code — вайб-кодинг с нуля",
      slug: "super-code",
      description:
        "Практический курс: собираем реальные проекты с помощью ИИ-инструментов, без скучной теории.",
    },
  });

  // --- Модули и уроки ---
  const modulesData = [
    {
      title: "Модуль 1. Введение в вайб-кодинг",
      orderIndex: 0,
      lessons: [
        {
          title: "Что такое вайб-кодинг и зачем он нужен",
          isFree: true,
          requiredTier: RequiredTier.free,
          duration: 720,
        },
        {
          title: "Настройка окружения и инструментов",
          isFree: true,
          requiredTier: RequiredTier.free,
          duration: 900,
        },
      ],
    },
    {
      title: "Модуль 2. Первый проект с ИИ",
      orderIndex: 1,
      lessons: [
        {
          title: "Промптинг для генерации кода",
          isFree: false,
          requiredTier: RequiredTier.plus,
          duration: 1080,
        },
        {
          title: "Собираем лендинг за один вечер",
          isFree: false,
          requiredTier: RequiredTier.plus,
          duration: 1500,
        },
      ],
    },
    {
      title: "Модуль 3. Продвинутое (Pro)",
      orderIndex: 2,
      lessons: [
        {
          title: "Полноценное приложение: БД, авторизация, деплой",
          isFree: false,
          requiredTier: RequiredTier.pro,
          duration: 2400,
        },
      ],
    },
  ];

  for (const m of modulesData) {
    const mod = await prisma.module.create({
      data: {
        courseId: course.id,
        title: m.title,
        orderIndex: m.orderIndex,
      },
    });
    let li = 0;
    for (const l of m.lessons) {
      await prisma.lesson.create({
        data: {
          moduleId: mod.id,
          title: l.title,
          description: "Описание урока появится здесь.",
          bunnyVideoId: null, // заполняется в админке после загрузки видео
          durationSeconds: l.duration,
          orderIndex: li++,
          isFree: l.isFree,
          requiredTier: l.requiredTier,
        },
      });
    }
  }

  // --- Викторина: 300 вопросов (100 на уровень novice/medium/pro) ---
  const quiz = await prisma.quiz.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      title: "Проверь себя: основы вайб-кодинга",
      description: "300 вопросов по программированию и IT — три уровня сложности.",
    },
  });

  const questionsData = JSON.parse(
    readFileSync(path.join(__dirname, "data", "quiz-questions.json"), "utf8"),
  ) as { text: string; options: string[]; correctIndex: number; difficulty: "novice" | "medium" | "pro" }[];

  const existingQuestions = await prisma.quizQuestion.count({ where: { quizId: quiz.id } });
  if (existingQuestions === 0) {
    const orderByDifficulty: Record<string, number> = { novice: 0, medium: 0, pro: 0 };
    for (const q of questionsData) {
      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          difficulty: q.difficulty,
          orderIndex: orderByDifficulty[q.difficulty]++,
        },
      });
    }
  }

  // --- Способ оплаты ---
  await prisma.paymentMethod.create({
    data: {
      bankName: "Алиф Банк",
      phoneNumber: "+992 90 000 00 00",
      recipientName: "Super Code Academy",
      isActive: true,
    },
  });

  console.log("Готово. Админ: admin@supercode.tj / admin12345");
  console.log("Ученик: student@supercode.tj / student12345");
  console.log("Курс создан:", course.title, "| админ id:", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
