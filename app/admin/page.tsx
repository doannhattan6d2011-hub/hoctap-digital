"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [files, setFiles] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("phanthiphuong_user");
    if (!stored) {
      window.location.href = "/auth/login";
      return;
    }

    try {
      const user = JSON.parse(stored);
      if (user.role !== 'admin') {
        alert("⚠️ Bạn cần tài khoản Admin Phan Thị Phương để truy cập!");
        window.location.href = "/auth/login";
        return;
      }
      setIsAdmin(true);
      fetchDocs();
    } catch {
      window.location.href = "/auth/login";
    }
  }, []);

  const fetchDocs = async () => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setFiles(data);
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (confirm("⚠️ Chị có chắc chắn muốn xóa vĩnh viễn tệp này?")) {
      const filePath = fileUrl.split('/').pop();
      if (filePath) {
        await supabase.storage.from('panthiphuong_files').remove([`documents/${filePath}`]);
      }
      await supabase.from('documents').delete().eq('id', id);
      fetchDocs();
    }
  };

  if (!isAdmin) return <div style={{ padding: "40px", textAlign: "center" }}>⏳ Đang xác thực quyền Quản trị...</div>;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "28px", color: "#1e40af", fontWeight: "900", margin: "0 0 6px 0" }}>🛡️ Bảng Quản Trị - Phan Thị Phương</h2>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>Quản lý danh sách tệp học liệu trên hệ thống đám mây.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/admin/new" style={{ background: "#10b981", color: "white", padding: "12px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>➕ Đăng Tải Bài Mới</Link>
            <Link href="/" style={{ background: "#0f172a", color: "white", padding: "12px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>🏠 Trang Chủ</Link>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", color: "#475569", textAlign: "left", fontSize: "14px" }}>
              <th style={{ padding: "16px" }}>Tên Học Liệu</th>
              <th style={{ padding: "16px" }}>Tệp Đính Kèm</th>
              <th style={{ padding: "16px", textAlign: "right" }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Chưa có tài liệu nào trong hệ thống.</td></tr>
            ) : files.map(doc => (
              <tr key={doc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px", fontWeight: "bold", color: "#0f172a" }}>{doc.title}</td>
                <td style={{ padding: "16px", color: "#2563eb", fontWeight: "600" }}>📄 {doc.file_name}</td>
                <td style={{ padding: "16px", textAlign: "right" }}>
                  <button onClick={() => handleDelete(doc.id, doc.file_url)} style={{ background: "#ef4444", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>🗑️ Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}