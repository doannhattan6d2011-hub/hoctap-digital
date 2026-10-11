import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // Tự động phân quyền Admin cho tài khoản admin hoặc phanthiphuong1976
    const isAdmin = cleanUsername === "admin" || cleanUsername.includes("phanthiphuong") || cleanUsername.includes("admin");

    const user = {
      username: cleanUsername,
      email: cleanUsername,
      role: isAdmin ? "admin" : "user",
      name: cleanUsername.split("@")[0],
    };

    const response = NextResponse.json({ message: "Đăng nhập thành công!", user });
    
    // Lưu phiên làm việc
    response.cookies.set("user_session", JSON.stringify(user), {
      httpOnly: true,
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi xử lý server", error: error.message }, { status: 500 });
  }
}