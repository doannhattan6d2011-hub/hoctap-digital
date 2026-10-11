import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Dữ liệu gửi lên không hợp lệ!" },
        { status: 400 }
      );
    }

    const { username, email, password } = body || {};
    const inputUser = String(username || email || "").trim().toLowerCase();
    const inputPass = String(password || "").trim();

    if (!inputUser || !inputPass) {
      return NextResponse.json(
        { message: "Vui lòng nhập tài khoản/email và mật khẩu!" },
        { status: 400 }
      );
    }

    // 1. Đọc danh sách người dùng đã đăng ký từ file data/users.json
    let registeredUsers: any[] = [];
    try {
      const usersFilePath = path.join(process.cwd(), "data", "users.json");
      if (fs.existsSync(usersFilePath)) {
        const content = await readFile(usersFilePath, "utf-8");
        registeredUsers = JSON.parse(content || "[]");
      }
    } catch (e) {
      console.warn("Không thể đọc file users.json:", e);
    }

    // 2. Tìm tài khoản trong cơ sở dữ liệu
    let matchedUser = registeredUsers.find(
      (u: any) =>
        (u.email && u.email.toLowerCase() === inputUser) ||
        (u.username && u.username.toLowerCase() === inputUser)
    );

    // 3. Nếu chưa đăng ký và cũng không phải tài khoản Admin đặc biệt
    const isSpecialAdmin =
      inputUser === "admin" || inputUser === "phanthiphuong1976";

    if (!matchedUser && !isSpecialAdmin) {
      return NextResponse.json(
        { message: "Tài khoản chưa được đăng ký trong hệ thống!" },
        { status: 401 }
      );
    }

    // 4. Kiểm tra mật khẩu (nếu là user đã đăng ký)
    if (matchedUser && matchedUser.password && matchedUser.password !== inputPass) {
      return NextResponse.json(
        { message: "Mật khẩu không chính xác!" },
        { status: 401 }
      );
    }

    // 5. Chuẩn hóa thông tin người dùng đăng nhập
    const user = matchedUser || {
      id: Date.now().toString(),
      username: inputUser,
      email: inputUser.includes("@") ? inputUser : `${inputUser}@system.local`,
      role: isSpecialAdmin ? "admin" : "user",
      name: inputUser,
    };

    const response = NextResponse.json({
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name || user.username,
      },
    });

    // Lưu Cookie phiên làm việc
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
      { message: "Lỗi hệ thống khi đăng nhập", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}