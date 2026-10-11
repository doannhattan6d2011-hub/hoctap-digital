import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ email và mật khẩu!" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu tối thiểu phải có từ 6 ký tự!" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin =
      cleanEmail.includes("admin") ||
      cleanEmail.includes("phanthiphuong");

    const user = {
      username: username || cleanEmail.split("@")[0],
      email: cleanEmail,
      role: isAdmin ? "admin" : "user",
      name: cleanEmail.split("@")[0],
    };

    const response = NextResponse.json({
      message: "Đăng ký thành công!",
      user,
    });

    // Tạo cookie đăng nhập ngay sau khi đăng ký thành công
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
      { message: "Lỗi xử lý đăng ký", error: error.message },
      { status: 500 }
    );
  }
}