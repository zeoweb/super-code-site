import { PrismaClient } from "@prisma/client";

// Единый экземпляр Prisma. В dev-режиме Next перезагружает модули,
// поэтому кэшируем клиента в globalThis, чтобы не плодить соединения.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
