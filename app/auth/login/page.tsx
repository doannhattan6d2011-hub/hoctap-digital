"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        if (user.role === "admin") window.location.href = "/admin";
        else window.location.href = "/";
      } catch (e) {}
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập tài khoản và mật khẩu!");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const inputUser = username.toLowerCase().trim();
      
      // 1. Tài khoản Admin gốc (Luôn được phép vào nếu đúng mật khẩu > 6 ký tự)
      if (inputUser === "admin" || inputUser === "phanthiphuong1976") {
        if (password.length < 6) {
          setError("Mật khẩu quản trị phải từ 6 ký tự!");
          setLoading(false);
          return;
        }
        const adminUser = { username: inputUser, role: "admin", name: "Quản trị viên" };
        localStorage.setItem("user_info", JSON.stringify(adminUser));
        window.location.href = "/admin";
        return;
      }

      // 2. Chặn đứng tài khoản lạ: Đối chiếu với danh sách đã đăng ký
      const usersStr = localStorage.getItem("mock_users") || "[]";
      const users = JSON.parse(usersStr);

      const matchedUser = users.find((u: any) => u.email === inputUser || u.username === inputUser);

      if (!matchedUser) {
        setError("❌ Tài khoản này chưa được đăng ký trong hệ thống!");
        setLoading(false);
        return;
      }

      if (matchedUser.password !== password) {
        setError("❌ Mật khẩu không chính xác!");
        setLoading(false);
        return;
      }

      // 3. Đăng nhập thành công cho User
      localStorage.setItem("user_info", JSON.stringify({
        username: matchedUser.username,
        email: matchedUser.email,
        role: matchedUser.role,
        name: matchedUser.name
      }));
      
      window.location.href = matchedUser.role === "admin" ? "/admin" : "/";
    }, 600);
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", width: "100%", maxWidth: "420px", border: "1px solid #e2e8f0" }}>
        
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>Đăng Nhập Hệ Thống</h2>
        </div>

        {error && (
          <div style={{ color: "#dc2626", padding: "12px", backgroundColor: "#fef2f2", borderRadius: "8px", marginBottom: "16px", border: "1px solid #fecaca", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Tài khoản hoặc Email" 
            style={{ padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px" }} 
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Mật khẩu" 
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
          <Link href="/auth/register" style={{ color: "#64748b", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Chưa có tài khoản? Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}