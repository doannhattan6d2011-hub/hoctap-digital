"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('profiles').insert([{ email, password, username, role: 'user' }]);
    if (error) return alert("❌ Email đã tồn tại!");
    
    alert("✅ Đăng ký thành công!");
    router.push('/auth/login');
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
      <form onSubmit={handleRegister} style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 15px rgba(0,0,0,0.1)", width: "400px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <h2 style={{ textAlign: "center", color: "#1e40af", fontWeight: "900", fontSize: "28px" }}>TẠO TÀI KHOẢN MỚI</h2>
        <input type="text" placeholder="Họ và Tên" required onChange={e=>setUsername(e.target.value)} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}/>
        <input type="email" placeholder="Email" required onChange={e=>setEmail(e.target.value)} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}/>
        <input type="password" placeholder="Mật khẩu" required onChange={e=>setPassword(e.target.value)} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}/>
        <button type="submit" style={{ padding: "16px", background: "#10b981", color: "white", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer" }}>ĐĂNG KÝ</button>
        <Link href="/auth/login" style={{ textAlign: "center", textDecoration: "none", color: "#64748b" }}>Đã có tài khoản? Đăng nhập</Link>
      </form>
    </div>
  );
}