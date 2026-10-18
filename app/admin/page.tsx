"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export interface AdminDocumentItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

export interface AdminUserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at?: string;
}

const AdminStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; }
    body { background-color: #f1f5f9; color: #0f172a; }

    .admin-container { max-width: 1320px; margin: 0 auto; padding: 32px 24px; }
    .admin-card { background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03); }
    .stat-card { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; display: flex; align-items: center; gap: 20px; }
    
    .table-responsive { width: 100%; overflow-x: auto; border-radius: 12px; border: 1px solid #f1f5f9; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .admin-table th { background: #f8fafc; color: #475569; padding: 16px; font-weight: 800; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 12px; }
    .admin-table td { padding: 18px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .admin-table tr:hover { background-color: #f8fafc; }

    .tab-btn { padding: 12px 24px; border-radius: 12px; border: none; font-weight: 700; font-size: 14px; cursor: pointer; background: transparent; color: #64748b; }
    .tab-btn.active { background: #2563eb; color: #ffffff; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); }

    .badge { padding: 6px 14px; border-radius: 50px; font-size: 12px; font-weight: 800; display: inline-block; }
    .badge-admin { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-user { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }

    .btn-delete { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .btn-delete:hover { background: #ef4444; color: #ffffff; }
  `}} />
);

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"DOCS" | "USERS">("DOCS");
  const [documents, setDocuments] = useState<AdminDocumentItem[]>([]);
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<AdminUserProfile | null>(null);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    // 1. Kiểm tra session từ LocalStorage ngay lập tức
    const storedUser = localStorage.getItem("phanthiphuong_user");

    if (!storedUser) {
      router.push("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      
      // Đảm bảo gán role admin nếu email thuộc hệ thống
      if (user.email?.includes("admin") || user.email?.includes("phanthiphuong")) {
        user.role = "admin";
        user.username = "Phan Thị Phương";
        localStorage.setItem("phanthiphuong_user", JSON.stringify(user));
      }

      setAdminUser(user);
    } catch (e) {
      router.push("/auth/login");
      return;
    }

    // 2. MỞ MÀN HÌNH QUẢN TRỊ NGHỆCH NGẠC (KHÔNG BỊ KẸT TẢI)
    setLoading(false);

    // 3. Tải dữ liệu đám mây từ Supabase
    fetchCloudData();
  }, [router]);

  const fetchCloudData = async () => {
    try {
      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (docsData) setDocuments(docsData);

      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersData) setUsers(usersData);
    } catch (e) {
      console.error("Lỗi kết nối dữ liệu:", e);
    }
  };

  const handleDeleteDocument = async (id: string, fileUrl: string, title: string) => {
    if (!confirm(`⚠️ Chị có chắc chắn muốn xóa bài giảng: "${title}" không?`)) return;

    try {
      const fileNameInStorage = fileUrl.split("/").pop();
      if (fileNameInStorage) {
        await supabase.storage
          .from("panthiphuong_files")
          .remove([`documents/${fileNameInStorage}`]);
      }

      await supabase.from("documents").delete().eq("id", id);
      alert("✅ Đã xóa bài giảng thành công!");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert("❌ Lỗi khi xóa tệp: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("phanthiphuong_user");
    router.push("/auth/login");
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.file_name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "sans-serif" }}>
        <h3 style={{ color: "#1e3a8a", fontWeight: "800" }}>⚡ Đang mở Bảng Quản Trị Phan Thị Phương...</h3>
      </div>
    );
  }

  return (
    <>
      <AdminStyles />
      <div className="admin-container">
        
        {/* HEADER BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", background: "#ffffff", padding: "24px 32px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#1e3a8a", margin: 0 }}>
              🛡️ Bảng Quản Trị - Phan Thị Phương
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Xin chào <strong style={{ color: "#0f172a" }}>{adminUser?.username || "Phan Thị Phương"}</strong>
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/admin/new" style={{ background: "#10b981", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", fontWeight: "800", textDecoration: "none", fontSize: "14px" }}>
              ➕ Đăng Tải Mới
            </Link>
            <Link href="/" style={{ background: "#0f172a", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", fontWeight: "800", textDecoration: "none", fontSize: "14px" }}>
              🏠 Trang Chủ
            </Link>
            <button onClick={handleLogout} style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "12px 18px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "14px" }}>
              Đăng Xuất
            </button>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <div className="stat-card">
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold" }}>📚</div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>{documents.length}</div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>Tổng Bài Giảng</div>
            </div>
          </div>

          <div className="stat-card">
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold" }}>👥</div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>{users.length}</div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>Thành Viên</div>
            </div>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className={`tab-btn ${activeTab === "DOCS" ? "active" : ""}`} onClick={() => setActiveTab("DOCS")}>
                📁 Học Liệu ({documents.length})
              </button>
              <button className={`tab-btn ${activeTab === "USERS" ? "active" : ""}`} onClick={() => setActiveTab("USERS")}>
                👥 Người Dùng ({users.length})
              </button>
            </div>

            <input
              type="text"
              placeholder="🔍 Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", width: "240px" }}
            />
          </div>

          {activeTab === "DOCS" && (
            <div className="table-responsive">
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
                      <td colSpan={4} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                        Chưa có học liệu nào.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: "700" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img src={doc.image_url || "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800"} alt="preview" style={{ width: "44px", height: "34px", borderRadius: "6px", objectFit: "cover" }} />
                            <span>{doc.title}</span>
                          </div>
                        </td>
                        <td style={{ color: "#2563eb", fontWeight: "700" }}>📄 {doc.file_name}</td>
                        <td style={{ color: "#64748b" }}>{new Date(doc.created_at).toLocaleDateString("vi-VN")}</td>
                        <td style={{ textAlign: "right" }}>
                          <button onClick={() => handleDeleteDocument(doc.id, doc.file_url, doc.title)} className="btn-delete">
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

          {activeTab === "USERS" && (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Vai Trò</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                        Chưa có người dùng nào.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: "700" }}>{u.username}</td>
                        <td style={{ color: "#64748b" }}>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === "admin" ? "badge-admin" : "badge-user"}`}>
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
    </>
  );
}