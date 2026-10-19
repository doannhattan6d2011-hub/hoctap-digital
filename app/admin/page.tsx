"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ============================================================================
// 1. CẤU TRÚC KIỂU DỮ LIỆU BẢNG QUẢN TRỊ
// ============================================================================
export interface AdminDocItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  file_name: string;
  file_url: string;
  created_at: string;
  grade: string;
  category: string;
  download_count: number;
}

export interface AdminUserItem {
  id: string;
  email: string;
  username: string;
  role: string;
}

export type AdminSortOption = "NEWEST" | "POPULAR" | "AZ";

// ============================================================================
// 2. STYLESHEET BẢNG QUẢN TRỊ
// ============================================================================
const AdminDashboardStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; }
    body { background-color: #f1f5f9; color: #0f172a; }

    .admin-wrapper { max-width: 1360px; margin: 0 auto; padding: 32px 24px; }
    .glass-card { background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03); }

    .metric-card {
      background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px;
      display: flex; align-items: center; gap: 20px;
    }

    .table-viewport { width: 100%; overflow-x: auto; border-radius: 12px; border: 1px solid #f1f5f9; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .data-table th { background: #f8fafc; color: #475569; padding: 16px; font-weight: 800; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 12px; }
    .data-table td { padding: 18px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .data-table tr:hover { background-color: #f8fafc; }

    .tab-trigger {
      padding: 12px 24px; border-radius: 12px; border: none; font-weight: 700; font-size: 14px;
      cursor: pointer; background: transparent; color: #64748b; transition: all 0.2s;
    }
    .tab-trigger.active { background: #2563eb; color: #ffffff; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); }

    .btn-delete-item {
      background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 8px 16px;
      border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .btn-delete-item:hover { background: #ef4444; color: #ffffff; }

    .select-sort-admin {
      padding: 10px 16px; border-radius: 10px; border: 1px solid #cbd5e1;
      font-weight: 700; font-size: 14px; color: #1e3a8a; outline: none; background: #f8fafc;
    }
  `}} />
);

// ============================================================================
// 3. MAIN COMPONENT BẢNG QUẢN TRỊ
// ============================================================================
export default function AdminPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"DOCS" | "USERS">("DOCS");
  const [documents, setDocuments] = useState<AdminDocItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AdminUserItem | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<AdminSortOption>("NEWEST");

  useEffect(() => {
    const stored = localStorage.getItem("phanthiphuong_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.role !== "admin") {
          alert("Chỉ Admin Phan Thị Phương mới có quyền truy cập!");
          router.push("/");
          return;
        }
        setCurrentUser(parsed);
      } catch {
        router.push("/auth/login");
        return;
      }
    } else {
      router.push("/auth/login");
      return;
    }

    loadCloudData();
  }, [router]);

  const loadCloudData = async () => {
    setFetching(true);
    try {
      const { data: docs } = await supabase.from("documents").select("*");
      if (docs) setDocuments(docs);

      const { data: profiles } = await supabase.from("profiles").select("*");
      if (profiles) setUsers(profiles);

    } catch (e) {
      console.error("Lỗi lấy dữ liệu Admin:", e);
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteDoc = async (id: string, fileUrl: string, title: string) => {
    if (!confirm(`⚠️ Chị chắc chắn muốn xóa vĩnh viễn bài giảng: "${title}"?`)) return;

    try {
      if (fileUrl) {
        const filePath = fileUrl.split("/").pop();
        if (filePath) {
          await supabase.storage.from("panthiphuong_files").remove([`documents/${filePath}`]);
        }
      }

      await supabase.from("documents").delete().eq("id", id);
      alert("✅ Đã xóa thành công!");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert("Lỗi khi xóa: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("phanthiphuong_user");
    router.push("/auth/login");
  };

  // LOGIC SẮP XẾP BẢNG QUẢN TRỊ
  const sortedDocuments = useMemo(() => {
    let filtered = documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "NEWEST") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "POPULAR") return (b.download_count || 0) - (a.download_count || 0);
      if (sortBy === "AZ") return a.title.localeCompare(b.title, "vi");
      return 0;
    });
  }, [documents, searchTerm, sortBy]);

  const totalDownloads = documents.reduce((sum, d) => sum + (d.download_count || 0), 0);

  return (
    <>
      <AdminDashboardStyles />

      <div className="admin-wrapper">
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", background: "#ffffff", padding: "24px 32px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#1e3a8a", margin: 0 }}>
              🛡️ Bảng Quản Trị - Phan Thị Phương
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Tài khoản Quản trị viên: <strong style={{ color: "#0f172a" }}>{currentUser?.username || "Phan Thị Phương"}</strong>
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/admin/new" style={{ background: "#10b981", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", fontWeight: "800", textDecoration: "none", fontSize: "14px" }}>
              ➕ Đăng Tải Mới
            </Link>
            <Link href="/admin/users" style={{ background: "#8b5cf6", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", fontWeight: "800", textDecoration: "none", fontSize: "14px" }}>
              👥 Quản Lý User / Mật Khẩu
            </Link>
            <Link href="/" style={{ background: "#0f172a", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", fontWeight: "800", textDecoration: "none", fontSize: "14px" }}>
              🏠 Trang Chủ
            </Link>
            <button onClick={handleLogout} style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "12px 18px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "14px" }}>
              Đăng Xuất
            </button>
          </div>
        </div>

        {/* METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <div className="metric-card">
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold" }}>📚</div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>{documents.length}</div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>Tổng Bài Giảng</div>
            </div>
          </div>

          <div className="metric-card">
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold" }}>📥</div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#16a34a" }}>{totalDownloads}</div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>Tổng Lượt Tải Toàn Trang</div>
            </div>
          </div>

          <div className="metric-card">
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold" }}>👥</div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>{users.length}</div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>Tài Khoản Đăng Ký</div>
            </div>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div className="glass-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button className={`tab-trigger ${activeTab === "DOCS" ? "active" : ""}`} onClick={() => setActiveTab("DOCS")}>
                📁 Quản Lý Học Liệu ({documents.length})
              </button>
              <button className={`tab-trigger ${activeTab === "USERS" ? "active" : ""}`} onClick={() => setActiveTab("USERS")}>
                👥 Danh Sách Thành Viên ({users.length})
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {activeTab === "DOCS" && (
                <select
                  className="select-sort-admin"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as AdminSortOption)}
                >
                  <option value="NEWEST">✨ Sắp xếp: Mới nhất</option>
                  <option value="POPULAR">🔥 Sắp xếp: Tải nhiều nhất</option>
                  <option value="AZ">🔤 Sắp xếp: Tên A-Z</option>
                </select>
              )}

              <input
                type="text"
                placeholder="🔍 Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", width: "220px" }}
              />
            </div>
          </div>

          {activeTab === "DOCS" && (
            <div className="table-viewport">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên Bài Giảng</th>
                    <th>Phân Loại</th>
                    <th>Lượt Tải</th>
                    <th>Ngày Đăng</th>
                    <th style={{ textAlign: "right" }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>⏳ Đang nạp dữ liệu...</td></tr>
                  ) : sortedDocuments.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>Không tìm thấy tài liệu.</td></tr>
                  ) : (
                    sortedDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: "800" }}>
                          <div>{doc.title}</div>
                          <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600" }}>📄 {doc.file_name}</div>
                        </td>
                        <td>
                          <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "800", marginRight: "6px" }}>{doc.grade}</span>
                          <span style={{ background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "800" }}>{doc.category}</span>
                        </td>
                        <td style={{ fontWeight: "800", color: "#16a34a" }}>📥 {doc.download_count || 0}</td>
                        <td style={{ color: "#64748b" }}>{new Date(doc.created_at).toLocaleDateString("vi-VN")}</td>
                        <td style={{ textAlign: "right" }}>
                          <button onClick={() => handleDeleteDoc(doc.id, doc.file_url, doc.title)} className="btn-delete-item">
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
            <div className="table-viewport">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Quyền Hạn</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: "800" }}>{u.username}</td>
                      <td style={{ color: "#64748b" }}>{u.email}</td>
                      <td>
                        <span style={{ padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: "800", background: u.role === "admin" ? "#fef3c7" : "#e0f2fe", color: u.role === "admin" ? "#b45309" : "#0369a1" }}>
                          {u.role ? u.role.toUpperCase() : "USER"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </>
  );
}