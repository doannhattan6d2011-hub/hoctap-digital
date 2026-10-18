"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("pan_user") || "{}");
    if (user.role !== 'admin') router.push('/');
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setFiles(data);
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (confirm("⚠️ Chắc chắn xóa vĩnh viễn?")) {
      // Trích xuất tên file từ URL để xóa trên Storage
      const filePath = fileUrl.split('/').pop();
      if (filePath) await supabase.storage.from('panthiphuong_files').remove([`documents/${filePath}`]);
      
      // Xóa trong DB
      await supabase.from('documents').delete().eq('id', id);
      fetchDocs();
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 15px rgba(0,0,0,0.05)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px" }}>
          <h2 style={{ fontSize: "32px", color: "#1e40af", fontWeight: "900" }}>🛡️ Bảng Điều Khiển Admin</h2>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/admin/users" style={{ background: "#8b5cf6", color: "white", padding: "12px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>Quản lý User</Link>
            <Link href="/admin/new" style={{ background: "#10b981", color: "white", padding: "12px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>Đăng Tải Mới</Link>
            <Link href="/" style={{ background: "#0f172a", color: "white", padding: "12px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>Trang Chủ</Link>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", color: "#475569", textAlign: "left" }}>
              <th style={{ padding: "16px" }}>Tên Học Liệu</th>
              <th style={{ padding: "16px" }}>Tệp Đính Kèm</th>
              <th style={{ padding: "16px", textAlign: "right" }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {files.map(doc => (
              <tr key={doc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px", fontWeight: "bold", color: "#0f172a" }}>{doc.title}</td>
                <td style={{ padding: "16px", color: "#2563eb", fontWeight: "600" }}>{doc.file_name}</td>
                <td style={{ padding: "16px", textAlign: "right" }}>
                  <button onClick={() => handleDelete(doc.id, doc.file_url)} style={{ background: "#ef4444", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}