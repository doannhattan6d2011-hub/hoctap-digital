import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Account() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return <div className="container" style={{padding:"48px 0"}}><div className="card" style={{padding:28,maxWidth:700}}><div className="muted" style={{fontSize:13}}>Tài khoản</div><h1 style={{margin:"6px 0 16px",fontSize:32}}>{user.email}</h1><p>Vai trò: <strong>{user.role}</strong></p><p>Trạng thái email: <strong>{user.emailVerifiedAt ? "Đã xác minh" : "Chưa xác minh"}</strong></p><form action="/api/auth/logout" method="post" style={{marginTop:20}}><button className="btn">Đăng xuất</button></form>{user.role === "ADMIN" && <div style={{marginTop:18}}><Link href="/admin" style={{fontWeight:700}}>Mở trang quản trị →</Link></div>}</div></div>;
}
