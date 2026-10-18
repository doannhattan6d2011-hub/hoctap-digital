"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ============================================================================
// 1. CẤU TRÚC KIỂU DỮ LIỆU (TYPESCRIPT INTERFACES)
// ============================================================================
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

export interface SystemLog {
  id: string;
  action: string;
  time: string;
  user: string;
  type: "info" | "warning" | "danger";
}

// ============================================================================
// 2. CSS BẢNG QUẢN TRỊ CAO CẤP (GIAO DIỆN CHUYÊN NGHIỆP)
// ============================================================================
const AdminStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; }
    body { background-color: #f1f5f9; color: #0f172a; overflow-x: hidden; }

    .admin-wrapper {
      max-width: 1320px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .admin-card {
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
    }

    .stat-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px -5px rgba(15, 23, 42, 0.06);
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
    }
    .admin-table th {
      background: #f8fafc;
      color: #475569;
      padding: 16px;
      font-weight: 800;
      border-bottom: 2px solid #e2e8f0;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.6px;
    }
    .admin-table td {
      padding: 18px 16px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }
    .admin-table tr:hover {
      background-color: #f8fafc;
    }

    .tab-nav-btn {
      padding: 12px 24px;
      border-radius: 12px;
      border: none;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      background: transparent;
      color: #64748b;
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .tab-nav-btn.active {
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    }

    .badge {
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 800;
      display: inline-block;
    }
    .badge-admin { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-user { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }

    .btn-danger {
      background: #fef2f2;
      color: #ef4444;
      border: 1px solid #fecaca;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-danger:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `}} />
);

// ============================================================================
// 3. MAIN COMPONENT: ADMIN DASHBOARD (KHÔNG BẮT LỖI TREO)
// ============================================================================
export default function AdminDashboardPage() {
  const router = useRouter();
  
  // States quản lý dữ liệu
  const [activeTab, setActiveTab] = useState<"DOCS" | "USERS" | "LOGS">("DOCS");
  const [documents, setDocuments] = useState<AdminDocumentItem[]>([]);
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminProfile, setAdminProfile] = useState<AdminUserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("Đang kết nối hệ thống...");

  // Bắt đầu kiểm tra và tải dữ liệu khi render
  useEffect(() => {
    let isMounted = true;

    // GIẢI PHÁP CHỐNG TREO: Giới hạn tối đa 2.5 giây cho tiến trình tải
    const safetyTimer = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Safety timeout hit - forced loading completion.");
        setLoading(false);
      }
    }, 2500);

    const initializeAdmin = async () => {
      try {
        setStatusMessage("Đang xác thực thông tin tài khoản...");
        const storedUser = localStorage.getItem("phanthiphuong_user");

        if (!storedUser) {
          router.push("/auth/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        
        // Tự động gán và cấp quyền Admin nếu là tài khoản chính chủ
        if (parsedUser.email?.includes("admin") || parsedUser.email?.includes("phanthiphuong")) {
          parsedUser.role = "admin";
          parsedUser.username = "Phan Thị Phương";
          localStorage.setItem("phanthiphuong_user", JSON.stringify(parsedUser));
        }

        if (parsedUser.role !== "admin") {
          alert("⚠️ Bạn cần quyền Quản trị viên để truy cập trang này!");
          router.push("/auth/login");
          return;
        }

        if (isMounted) setAdminProfile(parsedUser);

        // Tải dữ liệu từ Supabase
        setStatusMessage("Đang tải danh sách bài học...");
        await loadAllData();

      } catch (err) {
        console.error("Lỗi khởi tạo Admin:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAdmin();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [router]);

  // Tải dữ liệu chính từ Supabase
  const loadAllData = async () => {
    try {
      // 1. Tải Học Liệu
      const { data: docsData, error: docsErr } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (!docsErr && docsData) setDocuments(docsData);

      // 2. Tải Người Dùng
      const { data: usersData, error: usersErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!usersErr && usersData) setUsers(usersData);

      // 3. Khởi tạo Lịch sử hệ thống mẫu
      setLogs([
        { id: "log-1", action: "Đăng nhập hệ thống Quản trị", time: new Date().toLocaleTimeString("vi-VN"), user: "Phan Thị Phương", type: "info" },
        { id: "log-2", action: "Đồng bộ dữ liệu Supabase Cloud", time: new Date(Date.now() - 3600000).toLocaleTimeString("vi-VN"), user: "Hệ thống", type: "info" }
      ]);
    } catch (e) {
      console.error("Không thể lấy dữ liệu đám mây:", e);
    }
  };

  // Xóa tài liệu khỏi Storage và Database
  const handleDeleteDoc = async (id: string, fileUrl: string, title: string) => {
    if (!confirm(`⚠️ Chị có chắc chắn muốn xóa bài giảng: "${title}" không?`)) return;

    try {
      const fileNameInStorage = fileUrl.split("/").pop();
      if (fileNameInStorage) {
        await supabase.storage
          .from("panthiphuong_files")
          .remove([`documents/${fileNameInStorage}`]);
      }

      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;

      alert("✅ Đã xóa bài giảng vĩnh viễn!");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert("❌ Lỗi khi xóa tệp: " + err.message);
    }
  };

  // Đăng xuất khỏi hệ thống Admin
  const handleLogoutAdmin = () => {
    localStorage.removeItem("phanthiphuong_user");
    router.push("/auth/login");
  };

  // Bộ lọc dữ liệu theo thanh tìm kiếm
  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // GIAO DIỆN KHI ĐANG TẢI (CÓ TIMEOUT CHỐNG KẸT MAI MAI)
  if (loading) {
    return (
      <>
        <AdminStyles />
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", gap: "16px" }}>
          <div className="loading-spinner"></div>
          <h3 style={{ color: "#1e3a8a", fontSize: "18px", fontWeight: "800" }}>
            PHAN THỊ PHƯƠNG - HỆ THỐNG QUẢN TRỊ
          </h3>
          <p style={{ color: "#64748b", fontSize: "14px" }}>{statusMessage}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminStyles />

      <div className="admin-wrapper">
        
        {/* HEADER TOP BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", background: "#ffffff", padding: "24px 32px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#1e3a8a", margin: 0 }}>
              🛡️ Bảng Quản Trị - Phan Thị Phương
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Xin chào <strong style={{ color: "#0f172a" }}>{adminProfile?.username || "Cô Phan Thị Phương"}</strong> (Quản trị viên)
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/admin/new" style={{ background: "#10b981", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", fontWeight: "800", textDecoration: "none", fontSize: "14px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}>
              ➕ Đăng Tải Mới
            </Link>
            <Link href="/" style={{ background: "#0f172a", color: "#ffffff", padding: "12px 20px", borderRadius: "10px", fontWeight: "800", textDecoration: "none", fontSize: "14px" }}>
              🏠 Trang Chủ
            </Link>
            <button onClick={handleLogoutAdmin} style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "12px 18px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "14px" }}>
              Đăng Xuất
            </button>
          </div>
        </div>

        {/* CÁC THẺ THỐNG KÊ (DASHBOARD METRICS) */}
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
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>Tài Khoản Đăng Ký</div>
            </div>
          </div>

          <div className="stat-card">
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold" }}>⚡</div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "900", color: "#16a34a" }}>Hoạt Động</div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>Supabase Cloud Database</div>
            </div>
          </div>
        </div>

        {/* NỘI DUNG CHÍNH CHUYỂN TAB */}
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button className={`tab-nav-btn ${activeTab === "DOCS" ? "active" : ""}`} onClick={() => setActiveTab("DOCS")}>
                📁 Học Liệu ({documents.length})
              </button>
              <button className={`tab-nav-btn ${activeTab === "USERS" ? "active" : ""}`} onClick={() => setActiveTab("USERS")}>
                👥 Người Dùng ({users.length})
              </button>
              <button className={`tab-nav-btn ${activeTab === "LOGS" ? "active" : ""}`} onClick={() => setActiveTab("LOGS")}>
                📊 Nhật Ký ({logs.length})
              </button>
            </div>

            <input
              type="text"
              placeholder="🔍 Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", width: "240px" }}
            />
          </div>

          {/* TAB 1: DANH SÁCH BÀI HỌC */}
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
                        Chưa có bài giảng nào trên hệ thống.
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
                          <button onClick={() => handleDeleteDoc(doc.id, doc.file_url, doc.title)} className="btn-danger">
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

          {/* TAB 2: DANH SÁCH NGƯỜI DÙNG */}
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

          {/* TAB 3: NHẬT KÝ HỆ THỐNG */}
          {activeTab === "LOGS" && (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thời Gian</th>
                    <th>Hành Động</th>
                    <th>Người Thực Hiện</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ color: "#64748b", fontWeight: "600" }}>{log.time}</td>
                      <td style={{ fontWeight: "700", color: "#0f172a" }}>{log.action}</td>
                      <td style={{ color: "#2563eb", fontWeight: "700" }}>{log.user}</td>
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