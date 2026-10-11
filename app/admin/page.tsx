"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Database, DocumentItem } from "../../lib/db";

export default function AdminDashboard() {
  const [files, setFiles] = useState<DocumentItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFiles(Database.getDocuments());
    setMounted(true);
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`⚠️ Chị có chắc chắn muốn xóa vĩnh viễn bài giảng: "${title}" không?`)) {
      Database.deleteDocument(id);
      setFiles(Database.getDocuments()); // Tự động làm mới danh sách
    }
  };

  if (!mounted) return <div style={{ padding: "40px", textAlign: "center" }}>⏳ Đang tải hệ thống...</div>;

  return (
    <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px" }}>
        <h2 style={{ fontSize: "26px", color: "#0f172a", margin: 0, fontWeight: "800" }}>📁 Quản Lý Bài Giảng</h2>
        <Link href="/admin/new" style={{ padding: "12px 24px", backgroundColor: "#10b981", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "bold" }}>
          ➕ Đăng Tải Bài Mới
        </Link>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", color: "#475569", fontSize: "14px", textAlign: "left" }}>
              <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0", width: "40%" }}>Tên Học Liệu</th>
              <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0" }}>Tệp Đính Kèm</th>
              <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0" }}>Ngày Tải Lên</th>
              <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0", textAlign: "right" }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>Hệ thống chưa có bài giảng nào. Hãy bấm "Đăng Tải Bài Mới".</td></tr>
            ) : files.map((file) => (
              <tr key={file.id} style={{ transition: "0.2s" }}>
                <td style={{ padding: "20px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: "700", color: "#1e293b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={file.imageUrl} alt="thumb" style={{ width: "50px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{file.title}</span>
                  </div>
                </td>
                <td style={{ padding: "20px 16px", borderBottom: "1px solid #f1f5f9", color: "#2563eb", fontWeight: "600" }}>{file.fileName}</td>
                <td style={{ padding: "20px 16px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{new Date(file.createdAt).toLocaleDateString("vi-VN")}</td>
                <td style={{ padding: "20px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>
                  <button onClick={() => handleDelete(file.id, file.title)} style={{ padding: "10px 16px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>
                    🗑️ Xóa Bài
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}