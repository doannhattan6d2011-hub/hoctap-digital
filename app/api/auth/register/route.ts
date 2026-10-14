
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomToken, hashToken } from "@/lib/security";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Email không hợp lệ." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email đã được đăng ký." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const rawToken = randomToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "USER",
        verificationTokens: {
          create: {
            tokenHash,
            expiresAt,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    // Không tự đăng nhập tài khoản chưa xác minh email.
    // Token được trả về chỉ để kiểm thử luồng xác minh trong môi trường phát triển.
    const responseBody: {
      message: string;
      user: typeof user;
      verificationUrl?: string;
    } = {
      message: "Đăng ký thành công. Hãy xác minh email trước khi đăng nhập.",
      user,
    };

    if (process.env.NODE_ENV !== "production") {
      const baseUrl = new URL(request.url).origin;
      responseBody.verificationUrl =
        `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
    }

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/register:", error);

    return NextResponse.json(
      { message: "Không thể đăng ký tài khoản." },
      { status: 500 }
    );
  }
}
