"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('profiles').select('*').eq('email', email).eq('password', password).single();
    if (error || !data) return alert("❌ Sai email hoặc mật khẩu!");
    
    localStorage.setItem("pan_user", JSON.stringify(data));
    router.push('/');
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
      <form onSubmit={handleLogin} style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 15px rgba(0,0,0,0.1)", width: "400px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <h2 style={{ textAlign: "center", color: "#1e40af", fontWeight: "900", fontSize: "28px" }}>PAN THỊ PHƯƠNG</h2>
        <input type="email" placeholder="Email" required onChange={e=>setEmail(e.target.value)} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}/>
        <input type="password" placeholder="Mật khẩu" required onChange={e=>setPassword(e.target.value)} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}/>
        <button type="submit" style={{ padding: "16px", background: "#2563eb", color: "white", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer" }}>ĐĂNG NHẬP</button>
        <Link href="/auth/register" style={{ textAlign: "center", textDecoration: "none", color: "#64748b" }}>Chưa có tài khoản? Đăng ký</Link>
      </form>
    </div>
  );
}