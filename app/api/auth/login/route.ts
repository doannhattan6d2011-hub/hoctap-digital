
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || body.username || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập email và mật khẩu." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: "Tài khoản đã bị vô hiệu hóa." },
        { status: 403 }
      );
    }

    await createSession(user.id);

    const displayName = user.email.split("@")[0];

    return NextResponse.json({
      message: "Đăng nhập thành công.",
      user: {
        id: user.id,
        email: user.email,
        username: displayName,
        name: displayName,
        role: user.role.toLowerCase(),
        emailVerified: Boolean(user.emailVerifiedAt),
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login:", error);

    return NextResponse.json(
      { message: "Lỗi hệ thống khi đăng nhập." },
      { status: 500 }
    );
  }
}
