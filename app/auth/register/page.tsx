"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu tối thiểu phải có từ 6 ký tự!");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const cleanEmail = email.toLowerCase().trim();
        // Lấy danh sách đã đăng ký từ trình duyệt
        const usersStr = localStorage.getItem("mock_users") || "[]";
        const users = JSON.parse(usersStr);

        // Chống đăng ký trùng lặp
        const exists = users.find((u: any) => u.email === cleanEmail);
        if (exists) {
          setError("⚠️ Email này đã được đăng ký trước đó!");
          setLoading(false);
          return;
        }

        const isAdmin = cleanEmail.includes("admin") || cleanEmail.includes("phanthiphuong");

        const newUser = {
          username: cleanEmail.split("@")[0],
          email: cleanEmail,
          password: password,
          role: isAdmin ? "admin" : "user",
          name: cleanEmail.split("@")[0]
        };

        // Lưu tài khoản mới
        users.push(newUser);
        localStorage.setItem("mock_users", JSON.stringify(users));
        
        // Tự động đăng nhập
        const loginInfo = { ...newUser };
        delete (loginInfo as any).password; 
        localStorage.setItem("user_info", JSON.stringify(loginInfo));
        
        window.location.href = "/";
      } catch (err) {
        setError("Lỗi xử lý đăng ký!");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", width: "100%", maxWidth: "420px", border: "1px solid #e2e8f0" }}>
        
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>Đăng Ký Tài Khoản</h2>
        </div>

        {error && (
          <div style={{ color: "#dc2626", padding: "12px", backgroundColor: "#fef2f2", borderRadius: "8px", marginBottom: "16px", border: "1px solid #fecaca", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Nhập email của bạn..." 
              required
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }} 
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>Mật khẩu</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Mật khẩu (trên 6 ký tự)" 
              required
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ padding: "14px", backgroundColor: "#0f172a", color: "#fff", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "16px", marginTop: "8px" }}
          >
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/auth/login" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}