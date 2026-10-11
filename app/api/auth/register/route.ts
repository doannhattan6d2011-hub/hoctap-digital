import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
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

    const { email, password, username } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ Email và Mật khẩu!" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = username ? String(username).trim() : cleanEmail.split("@")[0];

    const isAdmin =
      cleanEmail.includes("admin") ||
      cleanEmail.includes("phanthiphuong");

    const newUser = {
      id: Date.now().toString(),
      username: cleanUsername,
      email: cleanEmail,
      password: String(password).trim(), // Lưu mật khẩu xác thực
      role: isAdmin ? "admin" : "user",
      name: cleanUsername,
      createdAt: new Date().toISOString(),
    };

    try {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true });
      }
      const usersFilePath = path.join(dataDir, "users.json");
      let users = [];
      if (fs.existsSync(usersFilePath)) {
        const content = await readFile(usersFilePath, "utf-8");
        users = JSON.parse(content || "[]");
      }

      const existing = users.find((u: any) => u.email === cleanEmail);
      if (existing) {
        return NextResponse.json(
          { message: "Email này đã được đăng ký trước đó!" },
          { status: 400 }
        );
      }

      users.push(newUser);
      await writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
    } catch (fsError) {
      console.warn("Lưu file users.json:", fsError);
    }

    const response = NextResponse.json({
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      },
    });

    response.cookies.set({
      name: "user_session",
      value: JSON.stringify(newUser),
      httpOnly: false,
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: "Lỗi xử lý đăng ký", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}