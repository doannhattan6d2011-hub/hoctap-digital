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
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .eq('password', cleanPassword)
      .single();

    if (error || !data) {
      return alert("❌ Email hoặc mật khẩu không chính xác!");
    }

    if (cleanEmail.includes("admin") || cleanEmail.includes("phanthiphuong")) {
      data.role = "admin";
      data.username = "Phan Thị Phương";
    }

    localStorage.setItem("phanthiphuong_user", JSON.stringify(data));

    if (data.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif" }}>
      <form onSubmit={handleLogin} style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "20px", border: "1px solid #e2e8f0" }}>
        <h2 style={{ textAlign: "center", color: "#1e40af", fontWeight: "900", fontSize: "26px", margin: 0 }}>
          PHAN THỊ PHƯƠNG
        </h2>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px", margin: 0 }}>Đăng nhập kho học liệu số</p>
        
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "13px", color: "#334155" }}>Email</label>
          <input type="email" placeholder="Nhập email..." required value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }}/>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "13px", color: "#334155" }}>Mật khẩu</label>
          <input type="password" placeholder="Nhập mật khẩu..." required value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }}/>
        </div>

        <button type="submit" style={{ padding: "16px", background: "#2563eb", color: "white", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "16px" }}>
          🚀 ĐĂNG NHẬP
        </button>

        <Link href="/auth/register" style={{ textAlign: "center", textDecoration: "none", color: "#64748b", fontSize: "14px" }}>
          Chưa có tài khoản? Đăng ký ngay
        </Link>
      </form>
    </div>
  );
}