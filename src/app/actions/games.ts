"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { saveUploadedLogo } from "@/lib/storage";
import type { GameCategory, PackageKind } from "@prisma/client";

const GAME_CATEGORIES: GameCategory[] = ["game", "service", "software"];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- Игры ---
export async function createGame(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const count = await prisma.game.count();
  const categoryRaw = String(formData.get("category") ?? "game");
  const data: { title: string; slug: string; orderIndex: number; category: GameCategory; imageUrl?: string } = {
    title,
    slug: slugify(title) || `game-${count + 1}`,
    orderIndex: count,
    category: GAME_CATEGORIES.includes(categoryRaw as GameCategory) ? (categoryRaw as GameCategory) : "game",
  };

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      data.imageUrl = await saveUploadedLogo(image);
    } catch (e) {
      console.error("Game image upload failed:", e instanceof Error ? e.message : e);
    }
  }

  await prisma.game.create({ data });
  revalidatePath("/admin/games");
  revalidatePath("/");
}

export async function updateGame(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const categoryRaw = String(formData.get("category") ?? "game");
  const data: { title: string; isActive: boolean; category: GameCategory; imageUrl?: string } = {
    title,
    isActive: formData.get("isActive") === "on",
    category: GAME_CATEGORIES.includes(categoryRaw as GameCategory) ? (categoryRaw as GameCategory) : "game",
  };

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      data.imageUrl = await saveUploadedLogo(image);
    } catch (e) {
      console.error("Game image upload failed:", e instanceof Error ? e.message : e);
    }
  }

  await prisma.game.update({ where: { id }, data });
  revalidatePath("/admin/games");
  revalidatePath("/");
}

export async function deleteGame(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.game.delete({ where: { id } });
  revalidatePath("/admin/games");
  revalidatePath("/");
}

// --- Товары внутри игры ---
export async function createPackage(formData: FormData) {
  await requireAdmin();
  const gameId = String(formData.get("gameId"));
  const title = String(formData.get("title") ?? "").trim();
  const price = Number(formData.get("price"));
  if (!title || !Number.isFinite(price) || price <= 0) return;

  const count = await prisma.package.count({ where: { gameId } });
  const data: {
    gameId: string;
    title: string;
    price: number;
    amount: number;
    region: string | null;
    kind: PackageKind;
    orderIndex: number;
    imageUrl?: string;
  } = {
    gameId,
    title,
    price,
    amount: Number(formData.get("amount") ?? 0) || 0,
    region: String(formData.get("region") ?? "").trim() || null,
    kind: (String(formData.get("kind") ?? "currency") as PackageKind) || "currency",
    orderIndex: count,
  };

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      data.imageUrl = await saveUploadedLogo(image);
    } catch (e) {
      console.error("Package image upload failed:", e instanceof Error ? e.message : e);
    }
  }

  await prisma.package.create({ data });
  revalidatePath("/admin/games");
  revalidatePath("/games");
}

export async function updatePackage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const price = Number(formData.get("price"));
  if (!title || !Number.isFinite(price) || price <= 0) return;

  const data: {
    title: string;
    price: number;
    amount: number;
    region: string | null;
    kind: PackageKind;
    isActive: boolean;
    imageUrl?: string;
  } = {
    title,
    price,
    amount: Number(formData.get("amount") ?? 0) || 0,
    region: String(formData.get("region") ?? "").trim() || null,
    kind: (String(formData.get("kind") ?? "currency") as PackageKind) || "currency",
    isActive: formData.get("isActive") === "on",
  };

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      data.imageUrl = await saveUploadedLogo(image);
    } catch (e) {
      console.error("Package image upload failed:", e instanceof Error ? e.message : e);
    }
  }

  await prisma.package.update({ where: { id }, data });
  revalidatePath("/admin/games");
  revalidatePath("/games");
}

export async function deletePackage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.package.delete({ where: { id } });
  revalidatePath("/admin/games");
  revalidatePath("/games");
}
