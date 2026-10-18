"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ============================================================================
// HỆ THỐNG KIỂU DỮ LIỆU BẢNG QUẢN TRỊ
// ============================================================================
export interface AdminDocument {
  id: string;
  title: string;
  description: string;
  image_url: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at?: string;
}

// ============================================================================
// STYLESHEET BẢNG QUẢN TRỊ (ADMIN CSS-IN-JS)
// ============================================================================
const AdminStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; }
    body { background-color: #f1f5f9; color: #0f172a; }

    .admin-card {
      background: #ffffff; border-radius: 16px;
      border: 1px solid #e2e8f0; padding: 28px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
    }

    .stat-box {
      background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;
      padding: 20px; display: flex; align-items: center; gap: 16px;
    }

    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th {
      background: #f8fafc; color: #475569; padding: 14px 16px;
      font-size: 13px; font-weight: 800; border-bottom: 2px solid #e2e8f0;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .admin-table td {
      padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px;
      color: #1e293b;
    }
    .admin-table tr:hover { background-color: #f8fafc; }

    .badge-role {
      padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 800;
      display: inline-block;
    }
    .badge-admin { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-user { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }

    .btn-action {
      padding: 8px 14px; border-radius: 8px; border: none; font-weight: 700;
      font-size: 13px; cursor: pointer; transition: 0.2s; display: inline-flex;
      align-items: center; gap: 6px; text-decoration: none;
    }
    .btn-delete { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
    .btn-delete:hover { background: #ef4444; color: white; }

    .tab-btn {
      padding: 12px 24px; border-radius: 10px; border: none; font-weight: 700;
      font-size: 14px; cursor: pointer; background: transparent; color: #64748b;
      transition: all 0.2s;
    }
    .tab-btn.active { background: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
  `}} />
);

// ============================================================================
// MAIN COMPONENT: ADMIN DASHBOARD
// ============================================================================
export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"DOCS" | "USERS">("DOCS");
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Kiểm tra quyền Admin bảo mật
  useEffect(() => {
    verifyAdminAuth();
  }, []);

  const verifyAdminAuth = () => {
    const stored = localStorage.getItem("phanthiphuong_user");
    if (!stored) {
      router.push("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(stored);
      // Tự động gán quyền admin cho tài khoản quản trị
      if (user.email?.includes("admin") || user.email?.includes("phanthiphuong")) {
        user.role = "admin";
        user.username = "Phan Thị Phương";
        localStorage.setItem("phanthiphuong_user", JSON.stringify(user));
      }

      if (user.role !== "admin") {
        alert("⚠️ Bạn cần tài khoản Admin Phan Thị Phương để truy cập!");
        router.push("/auth/login");
        return;
      }

      setAdminUser(user);
      loadDashboardData();
    } catch {
      router.push("/auth/login");
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Tải danh sách bài học
      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (docsData) setDocuments(docsData);

      // 2. Tải danh sách người dùng
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersData) setUsers(usersData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, fileUrl: string, title: string) => {
    if (!confirm(`⚠️ Chị có chắc chắn muốn xóa bài giảng: "${title}"?`)) return;

    try {
      // Xóa tệp gốc trên Supabase Storage
      const fileNameInStorage = fileUrl.split("/").pop();
      if (fileNameInStorage) {
        await supabase.storage
          .from("panthiphuong_files")
          .remove([`documents/${fileNameInStorage}`]);
      }

      // Xóa hàng trong Database
      const { error } = await supabase.from("documents").delete().eq("id", docId);
      if (error) throw error;

      alert("✅ Đã xóa vĩnh viễn bài giảng!");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert("❌ Lỗi khi xóa tệp: " + err.message);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#1e3a8a", marginBottom: "8px" }}>🛡️ PHAN THỊ PHƯƠNG - ADMIN</h2>
          <p style={{ color: "#64748b" }}>Đang đồng bộ dữ liệu quản trị từ máy chủ...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminStyles />

      <div style={{ minHeight: "100vh", padding: "32px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

          {/* HEADER ADMIN */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", background: "white", padding: "24px 32px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#1e3a8a", margin: 0 }}>
                🛡️ Bảng Điều Khiển Admin
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
                Xin chào Quản trị viên <strong style={{ color: "#0f172a" }}>{adminUser?.username}</strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Link href="/admin/new" style={{ background: "#10b981", color: "white", padding: "12px 20px", borderRadius: "10px", fontWeight: "700", textDecoration: "none", fontSize: "14px" }}>
                ➕ Đăng Tải Bài Mới
              </Link>
              <Link href="/" style={{ background: "#0f172a", color: "white", padding: "12px 20px", borderRadius: "10px", fontWeight: "700", textDecoration: "none", fontSize: "14px" }}>
                🏠 Về Trang Chủ
              </Link>
            </div>
          </div>

          {/* CHỈ SỐ THỐNG KÊ (METRICS) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
            <div className="stat-box">
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>📚</div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a" }}>{documents.length}</div>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Bài Giảng Đã Đăng</div>
              </div>
            </div>

            <div className="stat-box">
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>👥</div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a" }}>{users.length}</div>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Thành Viên Đăng Ký</div>
              </div>
            </div>

            <div className="stat-box">
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>☁️</div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a" }}>Hoạt Động</div>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Trạng Thái Máy Chủ</div>
              </div>
            </div>
          </div>

          {/* CHUYỂN TAB CÔNG CỤ QUẢN LÝ */}
          <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "2px solid #f1f5f9", paddingBottom: "16px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className={`tab-btn ${activeTab === "DOCS" ? "active" : ""}`} onClick={() => setActiveTab("DOCS")}>
                  📁 Quản Lý Học Liệu ({documents.length})
                </button>
                <button className={`tab-btn ${activeTab === "USERS" ? "active" : ""}`} onClick={() => setActiveTab("USERS")}>
                  👥 Quản Lý Tài Khoản ({users.length})
                </button>
              </div>

              <input
                type="text"
                placeholder="🔍 Tìm kiếm trong bảng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", width: "260px", fontSize: "14px" }}
              />
            </div>

            {/* TAB 1: DANH SÁCH BÀI GIẢNG */}
            {activeTab === "DOCS" && (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên Bài Giảng</th>
                      <th>Tệp Đính Kèm</th>
                      <th>Ngày Đăng</th>
                      <th style={{ textAlign: "right" }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                          Chưa có tài liệu nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => (
                        <tr key={doc.id}>
                          <td style={{ fontWeight: "700" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <img src={doc.image_url || "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800"} alt="thumb" style={{ width: "40px", height: "32px", borderRadius: "6px", objectFit: "cover" }} />
                              <span>{doc.title}</span>
                            </div>
                          </td>
                          <td style={{ color: "#2563eb", fontWeight: "600" }}>📄 {doc.file_name}</td>
                          <td style={{ color: "#64748b" }}>{new Date(doc.created_at).toLocaleDateString("vi-VN")}</td>
                          <td style={{ textAlign: "right" }}>
                            <button onClick={() => handleDeleteDocument(doc.id, doc.file_url, doc.title)} className="btn-action btn-delete">
                              🗑️ Xóa Bài
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: DANH SÁCH THÀNH VIÊN */}
            {activeTab === "USERS" && (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Họ và Tên</th>
                      <th>Email Liên Hệ</th>
                      <th>Quyền Hạn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                          Chưa có thành viên nào.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: "700" }}>{u.username}</td>
                          <td style={{ color: "#64748b" }}>{u.email}</td>
                          <td>
                            <span className={`badge-role ${u.role === "admin" ? "badge-admin" : "badge-user"}`}>
                              {u.role ? u.role.toUpperCase() : "USER"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}