"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const userInfo = localStorage.getItem("user_info");
    if (!userInfo) {
      window.location.href = "/auth/login";
      return;
    }
    try {
      const user = JSON.parse(userInfo);
      if (user.role !== "admin") {
        window.location.href = "/";
      } else {
        setIsAdmin(true);
        setAdminName(user.name || user.username || "Quản trị viên");
      }
    } catch {
      window.location.href = "/auth/login";
    }
  }, []);

  if (!isAdmin) return <div style={{ padding: "50px", textAlign: "center" }}>⏳ Đang tải hệ thống...</div>;

  const getMenuBg = (path: string) => pathname === path ? "#3b82f6" : "transparent";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "sans-serif" }}>
      {/* Cột Menu Bên Trái (Sidebar) */}
      <div style={{ width: "260px", backgroundColor: "#0f172a", color: "white", display: "flex", flexDirection: "column", boxShadow: "4px 0 10px rgba(0,0,0,0.1)", zIndex: 10 }}>
        <div style={{ padding: "24px 20px", fontSize: "20px", fontWeight: "900", borderBottom: "1px solid #1e293b", textAlign: "center", letterSpacing: "1px" }}>
          🚀 HỌC TẬP DIGITAL
        </div>
        <div style={{ padding: "20px 12px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <Link href="/admin" style={{ color: "#f8fafc", textDecoration: "none", fontSize: "15px", padding: "14px", borderRadius: "8px", backgroundColor: getMenuBg("/admin"), fontWeight: "600", transition: "0.2s" }}>📁 Quản lý Học Liệu</Link>
          <Link href="/admin/new" style={{ color: "#f8fafc", textDecoration: "none", fontSize: "15px", padding: "14px", borderRadius: "8px", backgroundColor: getMenuBg("/admin/new"), fontWeight: "600", transition: "0.2s" }}>➕ Đăng Tải Bài Mới</Link>
          <Link href="/admin/users" style={{ color: "#f8fafc", textDecoration: "none", fontSize: "15px", padding: "14px", borderRadius: "8px", backgroundColor: getMenuBg("/admin/users"), fontWeight: "600", transition: "0.2s" }}>👥 Quản lý Tài Khoản</Link>
        </div>
        <div style={{ padding: "20px", borderTop: "1px solid #1e293b", backgroundColor: "#020617" }}>
          <div style={{ marginBottom: "12px", fontSize: "13px", color: "#94a3b8" }}>👋 Xin chào, <b style={{color: "#fff"}}>{adminName}</b></div>
          <button onClick={() => { localStorage.removeItem("user_info"); window.location.href = "/auth/login"; }} style={{ width: "100%", padding: "12px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>🚪 Đăng xuất</button>
        </div>
      </div>

      {/* Khu vực nội dung bên phải */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto", position: "relative" }}>
        {/* Lớp phủ che cái Header mặc định cũ bị lỗi hiển thị */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100px", backgroundColor: "#f1f5f9", zIndex: -1 }}></div>
        {children}
      </div>
    </div>
  );
}