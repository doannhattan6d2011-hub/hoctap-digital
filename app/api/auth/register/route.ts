import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email này đã được sử dụng' },
        { status: 400 }
      );
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới (Chú ý field passwordHash)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: 'USER',
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công',
    });
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi đăng ký' },
      { status: 500 }
    );
  }
}