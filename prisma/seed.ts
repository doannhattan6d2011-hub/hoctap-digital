import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", emailVerifiedAt: new Date(), isActive: true },
    create: { email, passwordHash, role: "ADMIN", emailVerifiedAt: new Date(), isActive: true },
  });
  console.log(`Admin ready: ${email}`);
}

main().finally(() => prisma.$disconnect());
