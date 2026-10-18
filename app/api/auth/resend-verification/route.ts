import { prisma } from "@/lib/prisma";
import { normalizeEmail, hashToken, randomToken } from "@/lib/security";
import { sendMail, emailLayout } from "@/lib/email";
import { sameOrigin } from "@/lib/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const email = normalizeEmail((await request.json()).email || "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerifiedAt && user.isActive) {
    const token = randomToken();
    await prisma.verificationToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.verificationToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 86400000) } });
    const url = `${process.env.APP_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
    await sendMail({ to: email, subject: "Xác minh email — HocTap Digital", html: emailLayout("Xác minh email", `<p><a href="${url}">${url}</a></p>`) });
  }
  return Response.json({ message: "Nếu tài khoản hợp lệ, email xác minh đã được gửi." });
}
