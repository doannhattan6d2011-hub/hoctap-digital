"use client";

import React, { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("mock_users");
    if (stored) {
      setUsers(JSON.parse(stored));
    }
  }, []);

  const handleDelete = (email: string) => {
    if (confirm("⚠️ Cảnh báo: Xóa vĩnh viễn tài khoản này khỏi hệ thống?")) {
      const updated = users.filter(u => u.email !== email);
      setUsers(updated);
      localStorage.setItem("mock_users", JSON.stringify(updated));
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
      <h2 style={{ color: "#0f172a", marginBottom: "24px", fontSize: "24px", borderBottom: "2px solid #f1f5f9", paddingBottom: "16px" }}>👥 Quản Lý Tài Khoản Người Dùng</h2>
      
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8fafc", textAlign: "left", color: "#475569", fontSize: "14px" }}>
            <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0" }}>Tên Người Dùng</th>
            <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0" }}>Email</th>
            <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0" }}>Quyền Hạn</th>
            <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0", textAlign: "right" }}>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>Chưa có tài khoản nào đăng ký trên hệ thống.</td></tr>
          ) : users.map((u, i) => (
            <tr key={i}>
              <td style={{ padding: "16px", borderBottom: "1px solid #f1f5f9", fontWeight: "700", color: "#1e293b" }}>👤 {u.username}</td>
              <td style={{ padding: "16px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{u.email}</td>
              <td style={{ padding: "16px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ padding: "6px 12px", backgroundColor: u.role === "admin" ? "#fef08a" : "#e0f2fe", color: u.role === "admin" ? "#854d0e" : "#0369a1", borderRadius: "20px", fontSize: "12px", fontWeight: "800", letterSpacing: "0.5px" }}>
                  {u.role === "admin" ? "ADMIN" : "USER"}
                </span>
              </td>
              <td style={{ padding: "16px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>
                <button onClick={() => handleDelete(u.email)} style={{ padding: "8px 16px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>🗑️ Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}