"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface DocumentItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  description: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách học liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài giảng "${title}" không?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage("✅ Đã xóa bài giảng thành công!");
        fetchDocuments();
      } else {
        const data = await res.json();
        alert(`Không thể xóa: ${data.message || "Lỗi server"}`);
      }
    } catch (error) {
      alert("Xảy ra lỗi khi gửi yêu cầu xóa!");
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", color: "#1e293b" }}>
      
      {/* HEADER QUẢN TRỊ */}
      <header style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ backgroundColor: "#2563eb", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold" }}>HT</span>
          <h1 style={{ fontSize: "20px", fontWeight: "800", margin: 0 }}>Bảng Quản Lý Học Liệu</h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/"
            style={{ backgroundColor: "#334155", color: "#ffffff", padding: "10px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}
          >
            🏠 Xem Trang Chủ
          </Link>
          <Link
            href="/admin/new"
            style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "14px" }}
          >
            ➕ Upload Bài Mới
          </Link>
        </div>
      </header>

      {/* BẢNG QUẢN LÝ */}
      <main style={{ maxWidth: "1200px", margin: "32px auto", padding: "0 24px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 4px 0" }}>Danh Sách Bài Giảng & File</h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Tổng số bài giảng hiện có: <b>{documents.length}</b> tệp</p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="🔍 Tìm theo tên bài, môn, lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", width: "260px", outline: "none" }}
            />
            <button
              onClick={fetchDocuments}
              style={{ padding: "10px 16px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
            >
              🔄 Tải lại
            </button>
          </div>
        </div>

        {message && (
          <div style={{ backgroundColor: "#f0fdf4", color: "#16a34a", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #bbf7d0", fontWeight: "600" }}>
            {message}
          </div>
        )}

        <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>⏳ Đang tải danh sách học liệu...</div>
          ) : filteredDocs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#64748b", fontSize: "15px", margin: "0 0 12px 0" }}>Chưa có học liệu nào trong hệ thống.</p>
              <Link href="/admin/new" style={{ color: "#2563eb", fontWeight: "bold" }}>➕ Bấm vào đây để tải lên bài đầu tiên</Link>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "14px 16px" }}>Tên Học Liệu / Bài Giảng</th>
                  <th style={{ padding: "14px 16px" }}>Môn / Lớp</th>
                  <th style={{ padding: "14px 16px" }}>Tệp Đính Kèm</th>
                  <th style={{ padding: "14px 16px" }}>Ngày Đăng</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 16px", fontWeight: "600", color: "#0f172a" }}>
                      {doc.title}
                      {doc.topic && <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>Chủ đề: {doc.topic}</div>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", marginRight: "6px" }}>
                        {doc.subject}
                      </span>
                      <span style={{ backgroundColor: "#f1f5f9", color: "#334155", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                        {doc.grade}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName || "BaiGiang.pptx"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#16a34a", textDecoration: "none", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        📄 {doc.fileName || "Tải tệp (.pptx)"}
                      </a>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "13px" }}>
                      {doc.createdAt}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(doc.id, doc.title)}
                        style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

    </div>
  );
}