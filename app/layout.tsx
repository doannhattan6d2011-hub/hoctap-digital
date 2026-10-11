import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kho Học Liệu Số",
  description: "Nền tảng chia sẻ và lưu trữ học liệu số",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* Chỉ render nội dung chính của từng trang, loại bỏ Navbar thừa */}
        <main>{children}</main>
      </body>
    </html>
  );
}