"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Nếu đã đăng nhập rồi mà lỡ vào lại trang Login -> Đá văng ra luôn
  useEffect(() => {
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        if (user.role === "admin") router.replace("/admin");
        else router.replace("/");
      } catch (e) {}
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập tài khoản và mật khẩu!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");

      // 1. Lưu quyền Admin chuẩn xác vào bộ nhớ
      localStorage.setItem("user_info", JSON.stringify(data.user));

      // 2. Chuyển hướng cứng (Force Redirect) để làm mới toàn trang
      if (data.user?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", width: "100%", maxWidth: "420px", border: "1px solid #e2e8f0" }}>
        
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>Đăng Nhập Quản Trị</h2>
        </div>

        {error && (
          <div style={{ color: "#dc2626", padding: "12px", backgroundColor: "#fef2f2", borderRadius: "8px", marginBottom: "16px", border: "1px solid #fecaca" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Tài khoản (VD: admin hoặc phanthiphuong1976)" 
            style={{ padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px" }} 
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Mật khẩu (Nhập trên 6 ký tự)" 
            style={{ padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px" }} 
          />
          <button 
            type="submit" 
            disabled={loading} 
            style={{ padding: "14px", backgroundColor: "#2563eb", color: "#fff", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "16px" }}
          >
            {loading ? "Đang xử lý..." : "🚀 Đăng Nhập"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>← Quay về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}