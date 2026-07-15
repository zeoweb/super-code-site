import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

const COOKIE_NAME = "sc_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET не задан в .env");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string; // user id
  role: Role;
  name: string;
};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Создаём JWT и кладём в httpOnly cookie.
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function destroySession(): void {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

// Верификация токена (используется и в middleware, и в серверных компонентах).
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      sub: String(payload.sub),
      role: (payload.role as Role) ?? "student",
      name: (payload.name as string) ?? "",
    };
  } catch {
    return null;
  }
}

// Текущая сессия из cookie (без запроса в БД).
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Полный пользователь из БД по текущей сессии.
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.sub } });
}

export const SESSION_COOKIE = COOKIE_NAME;
