import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken, randomToken } from "@/lib/security";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập email." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Không tiết lộ email có tồn tại hay không
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.",
      });
    }

    // Xóa các token reset cũ
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    const rawToken = randomToken(32);
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    const appUrl =
      process.env.APP_URL || "http://localhost:3000";

    const resetUrl =
      `${appUrl}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;

    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({
      success: true,
      message:
        "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.",
    });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);

    return NextResponse.json(
      { error: "Không thể xử lý yêu cầu." },
      { status: 500 }
    );
  }
}