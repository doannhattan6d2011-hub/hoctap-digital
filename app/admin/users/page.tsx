"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", background: "white", padding: "40px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", color: "#1e40af", margin: 0, fontWeight: "900" }}>👥 Quản Lý Người Dùng</h2>
          <Link href="/admin" style={{ background: "#0f172a", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>Quay Lại Admin</Link>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              <th style={{ padding: "14px" }}>Họ và Tên</th>
              <th style={{ padding: "14px" }}>Email</th>
              <th style={{ padding: "14px" }}>Quyền Hạn</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "14px", fontWeight: "bold" }}>{u.username}</td>
                <td style={{ padding: "14px", color: "#64748b" }}>{u.email}</td>
                <td style={{ padding: "14px" }}>
                  <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", background: u.role === "admin" ? "#fef08a" : "#e0f2fe", color: u.role === "admin" ? "#854d0e" : "#0369a1" }}>
                    {u.role ? u.role.toUpperCase() : "USER"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}