import "server-only";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

import { hashToken, randomToken } from "@/lib/security";

const COOKIE = process.env.SESSION_COOKIE_NAME || "hoctap_session";

const SESSION_DAYS = 14;

export async function createSession(userId: string) {
  const raw = randomToken(32);

  const tokenHash = hashToken(raw);

  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const jar = await cookies();

  jar.set(COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();

  const raw = jar.get(COOKIE)?.value;

  if (raw) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashToken(raw),
      },
    });
  }
}

export async function getCurrentUser() {
  const jar = await cookies();

  const raw = jar.get(COOKIE)?.value;

  if (!raw) return null;

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(raw),
    },
    include: {
      user: true,
    },
  });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    !session.user.isActive
  ) {
    if (session) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      }).catch(() => {});
    }

    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user || !user.emailVerifiedAt) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  const configuredAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!configuredAdmin || user.email !== configuredAdmin) {
    throw new Error("FORBIDDEN");
  }

  return user;
}