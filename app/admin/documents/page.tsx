"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  fileName: string;
  createdAt: string;
}

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("hoctap_digital_docs");
    if (stored) {
      setDocs(JSON.parse(stored));
    }
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`⚠️ Chị có chắc chắn muốn xóa tài liệu: "${title}" không?`)) {
      const updated = docs.filter(d => d.id !== id);
      setDocs(updated);
      localStorage.setItem("hoctap_digital_docs", JSON.stringify(updated));
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 24px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "30px", fontWeight: "900", color: "#0f172a", margin: "0 0 6px 0" }}>📁 Quản Lý Học Liệu Số</h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Quản lý, xem và xóa các bài giảng trực tiếp trên hệ thống.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/admin/new" style={{ padding: "12px 20px", background: "#10b981", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "14px" }}>
              ➕ Đăng Tải Bài Mới
            </Link>
            <Link href="/" style={{ padding: "12px 20px", background: "#0f172a", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "14px" }}>
              🏠 Về Trang Chủ
            </Link>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", overflow: "hidden", padding: "24px" }}>
          {docs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#64748b", fontStyle: "italic" }}>
              Chưa có tài liệu nào trong hệ thống. Hãy bấm "Đăng Tải Bài Mới".
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#475569", fontSize: "14px", textAlign: "left" }}>
                    <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0", width: "45%" }}>Tên Học Liệu</th>
                    <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0" }}>Tệp Đính Kèm</th>
                    <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0" }}>Ngày Đăng</th>
                    <th style={{ padding: "16px", borderBottom: "2px solid #e2e8f0", textAlign: "right" }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.id} style={{ transition: "0.2s" }}>
                      <td style={{ padding: "16px", borderBottom: "1px solid #f1f5f9", fontWeight: "700", color: "#1e293b" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img src={doc.imageUrl} alt="thumb" style={{ width: "48px", height: "36px", borderRadius: "6px", objectFit: "cover" }} />
                          <span>{doc.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #f1f5f9", color: "#2563eb", fontWeight: "600" }}>📄 {doc.fileName}</td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{new Date(doc.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td style={{ padding: "16px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>
                        <button onClick={() => handleDelete(doc.id, doc.title)} style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>
                          🗑️ Xóa Bài
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}