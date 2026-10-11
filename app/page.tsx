"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DocumentItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  description: string;
  fileName: string;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Đọc thông tin người dùng từ localStorage
    const savedUser = localStorage.getItem("user_info");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }
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
      console.error("Lỗi lấy danh sách bài giảng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("user_info");
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.reload();
  };

  const handleDownload = (docId: string, docTitle: string) => {
    if (!user) {
      alert(`⚠️ Bạn phải đăng nhập tài khoản mới có thể tải tệp bài giảng "${docTitle}"!`);
      router.push("/auth/login");
      return;
    }
    window.open(`/api/download?id=${docId}`, "_blank");
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", color: "#1e293b", margin: 0, padding: 0 }}>
      
      {/* HEADER DUY NHẤT VÀ CHUẨN ĐẸP */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ textDecoration: "none", fontSize: "20px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "4px 10px", borderRadius: "8px", fontSize: "16px" }}>HT</span>
          HocTap <span style={{ color: "#2563eb" }}>Digital</span>
        </Link>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#2563eb", fontWeight: "600", fontSize: "14px" }}>
            Học liệu
          </Link>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
                👤 {user.name || user.username} ({user.role === "admin" ? "Quản trị viên" : "Thành viên"})
              </span>

              {/* HIỂN THỊ NÚT QUẢN TRỊ KHI LÀ ADMIN */}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}
                >
                  ⚙️ Trang Quản Lý Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                style={{ backgroundColor: "#f1f5f9", color: "#dc2626", border: "1px solid #fecaca", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
              >
                Đăng Xuất
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <Link
                href="/auth/login"
                style={{ textDecoration: "none", color: "#334155", fontWeight: "600", fontSize: "14px", padding: "8px 14px" }}
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/register"
                style={{ textDecoration: "none", backgroundColor: "#0f172a", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px" }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* BANNER HỌC LIỆU */}
      <section style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "36px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 8px 0" }}>📚 Kho Học Liệu Số</h2>
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
          {user ? `Xin chào ${user.name || user.username}, bạn có thể xem và tải các tệp bài giảng bên dưới.` : "Đăng nhập để thực hiện tải tệp bài giảng PowerPoint."}
        </p>
      </section>

      {/* DANH SÁCH BÀI GIẢNG */}
      <main style={{ maxWidth: "1100px", margin: "32px auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "800", margin: 0 }}>Danh Sách Bài Giảng PowerPoint</h3>
          <button onClick={fetchDocuments} style={{ padding: "8px 14px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
            🔄 Cập nhật
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>⏳ Đang tải bài giảng...</div>
        ) : documents.length === 0 ? (
          <div style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
            <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>Chưa có bài giảng nào trong hệ thống.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {documents.map((doc) => (
              <div key={doc.id} style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                    <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", fontSize: "11px", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px" }}>
                      {doc.subject}
                    </span>
                    <span style={{ backgroundColor: "#f1f5f9", color: "#334155", fontSize: "11px", fontWeight: "600", padding: "4px 8px", borderRadius: "4px" }}>
                      {doc.grade}
                    </span>
                  </div>

                  <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>
                    {doc.title}
                  </h4>

                  <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                    {doc.description || "Không có mô tả."}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>📅 {doc.createdAt}</span>
                  
                  <button
                    onClick={() => handleDownload(doc.id, doc.title)}
                    style={{
                      backgroundColor: user ? "#22c55e" : "#2563eb",
                      color: "#ffffff",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    {user ? "⬇️ Tải Tệp Bài Giảng" : "🔒 Tải Tệp Bài Giảng"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}