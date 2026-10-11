import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = String(body.token || "");
    const password = String(body.password || "");

    if (!token) {
      return NextResponse.json(
        { error: "Liên kết đặt lại mật khẩu không hợp lệ." },
        { status: 400 }
      );
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 12 ký tự." },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
      });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt <= new Date()
    ) {
      return NextResponse.json(
        { error: "Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),

      // Đăng xuất các phiên đăng nhập cũ
      prisma.session.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Đặt lại mật khẩu thành công.",
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);

    return NextResponse.json(
      { error: "Không thể đặt lại mật khẩu." },
      { status: 500 }
    );
  }
}