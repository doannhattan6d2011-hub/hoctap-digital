import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/security";
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return Response.json({ error: "Thiếu token" }, { status: 400 });
  const row = await prisma.verificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!row || row.usedAt || row.expiresAt <= new Date()) return Response.json({ error: "Token không hợp lệ" }, { status: 400 });
  await prisma.$transaction([prisma.user.update({ where: { id: row.userId }, data: { emailVerifiedAt: new Date() } }), prisma.verificationToken.update({ where: { id: row.id }, data: { usedAt: new Date() } })]);
  return Response.json({ ok: true });
}
