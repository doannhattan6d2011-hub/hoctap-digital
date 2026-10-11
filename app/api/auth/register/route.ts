import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, username } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ Email và Mật khẩu!" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = username ? String(username).trim() : cleanEmail.split("@")[0];

    // Tự động phân quyền Admin nếu email chứa phanthiphuong hoặc admin
    const isAdmin = cleanEmail.includes("admin") || cleanEmail.includes("phanthiphuong");

    const user = {
      username: cleanUsername,
      email: cleanEmail,
      role: isAdmin ? "admin" : "user",
      name: cleanUsername,
    };

    const response = NextResponse.json({
      message: "Đăng ký tài khoản thành công!",
      user,
    });

    // Lưu cookie phiên đăng nhập
    response.cookies.set({
      name: "user_session",
      value: JSON.stringify(user),
      httpOnly: false,
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: "Lỗi hệ thống khi đăng ký", error: error.message },
      { status: 500 }
    );
  }
}