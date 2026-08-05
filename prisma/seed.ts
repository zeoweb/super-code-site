/**
 * Наполнение базы демо-данными.
 * Запуск:  npm run db:seed
 *
 * Создаёт:
 *  - админа (email: admin@supercode.tj / пароль: admin12345)
 *  - демо-ученика (student@supercode.tj / student12345)
 *  - способ оплаты (банк)
 *  - тестимониалы со старого FF Donate Bot (перенос, текст как есть)
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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
      referralCode: "ADMIN001",
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
      referralCode: "DEMO0001",
    },
  });

  await prisma.paymentMethod.upsert({
    where: { id: "00000000-0000-0000-0000-0000000000f1" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-0000000000f1",
      bankName: "Алиф Банк",
      phoneNumber: "+992 90 000 00 00",
      recipientName: "SuperDonat",
      isActive: true,
    },
  });

  const testimonials = [
    { id: "00000000-0000-0000-0000-0000000000r1", name: "Jasur", rating: 5, text: "гапт надорм брат алмазо дар 1 минут омадан" },
    { id: "00000000-0000-0000-0000-0000000000r2", name: "Шамшод", rating: 4, text: "сайти боваринокай бемалол данат кнен хамаш 100%" },
    { id: "00000000-0000-0000-0000-0000000000r3", name: "Max", rating: 5, text: "Рахмат омад" },
    { id: "00000000-0000-0000-0000-0000000000r4", name: "Aminjon", rating: 5, text: "Уже сеюмбор донат кадестам хамаш зурай барои хами 5 звезда мемонм" },
  ];
  for (const t of testimonials) {
    await prisma.review.upsert({
      where: { id: t.id },
      update: {},
      create: { id: t.id, name: t.name, rating: t.rating, text: t.text },
    });
  }

  console.log("Готово. Админ: admin@supercode.tj / admin12345");
  console.log("Ученик: student@supercode.tj / student12345");
  console.log("Admin id:", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
