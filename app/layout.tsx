import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pan Thị Phương | Kho Học Liệu Số",
  description: "Hệ thống quản lý và chia sẻ học liệu an toàn, bảo mật.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className} style={{ margin: 0, padding: 0, backgroundColor: "#f8fafc" }}>
        <main>{children}</main>
      </body>
    </html>
  );
}