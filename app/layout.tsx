import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "HocTap Digital",
  description: "Kho học liệu PowerPoint riêng tư cho học sinh",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="vi">
      <body>
        <header style={{background:"#fff",borderBottom:"1px solid #e5e7eb"}}>
          <div className="container" style={{height:64,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
            <Link href="/" style={{fontWeight:800,fontSize:20}}>HocTap Digital</Link>
            <nav style={{display:"flex",alignItems:"center",gap:14,fontSize:14}}>
              <Link href="/documents">Học liệu</Link>
              {user ? <Link href="/account">Tài khoản</Link> : <><Link href="/auth/login">Đăng nhập</Link><Link className="btn btn-primary" href="/auth/register">Đăng ký</Link></>}
              {user?.role === "ADMIN" && <Link className="btn" href="/admin">Quản trị</Link>}
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
