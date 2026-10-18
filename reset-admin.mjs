import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Đang xóa toàn bộ dữ liệu Session, Token, Download và User cũ...');

  // Xóa các dữ liệu phụ thuộc trước
  await prisma.download.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  
  // Xóa tất cả Users
  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`✅ Đã xóa ${deletedUsers.count} tài khoản cũ.`);

  // Thông tin Admin mới (lấy từ .env hoặc cấu hình mặc định)
  const adminEmail = process.env.ADMIN_EMAIL || 'phanthiphuong1976@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'phuong1976@123';

  console.log(`🔑 Đang tạo tài khoản ADMIN mới: ${adminEmail}...`);

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const newAdmin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      emailVerifiedAt: new Date(), // Đã xác minh email luôn
    },
  });

  console.log('🎉 TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!');
  console.log('-----------------------------------');
  console.log(`Email:    ${newAdmin.email}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Role:     ${newAdmin.role}`);
  console.log('-----------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi chạy script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });