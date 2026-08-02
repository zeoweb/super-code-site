/**
 * Наполнение базы демо-данными.
 * Запуск:  npm run db:seed
 *
 * Создаёт:
 *  - админа (email: admin@supercode.tj / пароль: admin12345)
 *  - демо-ученика (student@supercode.tj / student12345)
 *  - способ оплаты (банк)
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
