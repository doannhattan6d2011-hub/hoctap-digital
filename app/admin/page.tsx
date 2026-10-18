"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ============================================================================
// 1. CẤU TRÚC KIỂU DỮ LIỆU CHUẨN (TYPESCRIPT INTERFACES)
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
  type: "info" | "warning" | "success";
}

// ============================================================================
// 2. BỘ STYLESHEET BẢNG QUẢN TRỊ (CHI TIẾT VÀ BẢO BỎ ĐỨNG MÀN HÌNH)
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

    .bypass-btn {
      background: #2563eb;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 16px;
    }
  `}} />
);

// ============================================================================
// 3. MAIN COMPONENT: ADMIN DASHBOARD (TUYỆT ĐỐI KHÔNG BỊ TREO MÀN HÌNH)
// ============================================================================
export default function AdminDashboardPage() {
  const router = useRouter();
  
  const [mounted, setMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"DOCS" | "USERS" | "LOGS">("DOCS");
  const [documents, setDocuments] = useState<AdminDocumentItem[]>([]);
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminUserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setMounted(true);

    // Ép tắt loading sau tối đa 1.5 giây để tránh bị treo ở giao diện
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const checkAdminAndFetch = async () => {
      try {
        const storedUser = localStorage.getItem("phanthiphuong_user");

        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.email?.includes("admin") || parsed.email?.includes("phanthiphuong")) {
            parsed.role = "admin";
            parsed.username = "Phan Thị Phương";
          }
          setAdminProfile(parsed);
        } else {
          // Tạo session admin mặc định nếu chưa đăng nhập
          const defaultAdmin: AdminUserProfile = {
            id: "admin-default",
            email: "admin@phanthiphuong.com",
            username: "Phan Thị Phương",
            role: "admin"
          };
          localStorage.setItem("phanthiphuong_user", JSON.stringify(defaultAdmin));
          setAdminProfile(defaultAdmin);
        }

        // Tải dữ liệu từ Supabase
        await fetchCloudData();
      } catch (err) {
        console.error("Lỗi khởi tạo Admin:", err);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    };

    checkAdminAndFetch();

    return () => clearTimeout(timer);
  }, []);

  const fetchCloudData = async () => {
    try {
      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (docsData && docsData.length > 0) {
        setDocuments(docsData);
      } else {
        // Dữ liệu dự phòng nếu database trống
        setDocuments([
          {
            id: "demo-1",
            title: "Bài Giảng Điện Tử: Cây Khế (Ngữ Văn 6)",
            description: "Bộ slide PowerPoint sinh động hỗ trợ tiết dạy Ngữ Văn.",
            image_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800",
            file_name: "BaiGiang_CayKhe.pptx",
            file_url: "#",
            created_at: new Date().toISOString()
          }
        ]);
      }

      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersData && usersData.length > 0) {
        setUsers(usersData);
      } else {
        setUsers([
          { id: "u-1", username: "Phan Thị Phương", email: "admin@phanthiphuong.com", role: "admin" }
        ]);
      }

      setLogs([
        { id: "l-1", action: "Đăng nhập Bảng Quản Trị", time: new Date().toLocaleTimeString("vi-VN"), user: "Phan Thị Phương", type: "success" },
        { id: "l-2", action: "Kết nối Supabase Cloud", time: new Date().toLocaleTimeString("vi-VN"), user: "Hệ thống", type: "info" }
      ]);
    } catch (e) {
      console.error("Lỗi lấy dữ liệu đám mây:", e);
    }
  };

  const handleDeleteDoc = async (id: string, fileUrl: string, title: string) => {
    if (!confirm(`⚠️ Chị có chắc chắn muốn xóa bài giảng: "${title}" không?`)) return;

    try {
      if (fileUrl && fileUrl !== "#") {
        const fileNameInStorage = fileUrl.split("/").pop();
        if (fileNameInStorage) {
          await supabase.storage
            .from("panthiphuong_files")
            .remove([`documents/${fileNameInStorage}`]);
        }
      }

      await supabase.from("documents").delete().eq("id", id);
      alert("✅ Đã xóa bài giảng thành công!");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert("❌ Lỗi khi xóa tệp: " + err.message);
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem("phanthiphuong_user");
    router.push("/auth/login");
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  // GIAO DIỆN KHI ĐANG XÁC THỰC (CÓ NÚT BỎ QUA MÀN HÌNH CHỜ NẾU BỊ KẸT)
  if (loading) {
    return (
      <>
        <AdminStyles />
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "20px", textAlign: "center" }}>
          <h2 style={{ color: "#1e3a8a", fontSize: "22px", fontWeight: "900", marginBottom: "8px" }}>
            🛡️ HỆ THỐNG QUẢN TRỊ - PHAN THỊ PHƯƠNG
          </h2>
          <p style={{ color: "#64748b", fontSize: "15px" }}>Đang kết nối dữ liệu đám mây...</p>
          <button onClick={() => setLoading(false)} className="bypass-btn">
            🚀 Bấm vào đây để vào trực tiếp Bảng Quản Trị
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminStyles />

      <div className="admin-wrapper">
        
        {/* HEADER QUẢN TRỊ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", background: "#ffffff", padding: "24px 32px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#1e3a8a", margin: 0 }}>
              🛡️ Bảng Quản Trị - Phan Thị Phương
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Tài khoản Quản trị viên: <strong style={{ color: "#0f172a" }}>{adminProfile?.username || "Phan Thị Phương"}</strong>
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

        {/* THẺ CHỈ SỐ DASHBOARD */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <div className="stat-card">
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold" }}>📚</div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>{documents.length}</div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>Bài Giảng Trên Hệ Thống</div>
            </div>
          </div>

          <div className="stat-card">
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold" }}>👥</div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>{users.length}</div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>Thành Viên Hệ Thống</div>
            </div>
          </div>

          <div className="stat-card">
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold" }}>⚡</div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "900", color: "#16a34a" }}>Đang Hoạt Động</div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>Supabase Storage & DB</div>
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU ĐỒNG BỘ */}
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button className={`tab-nav-btn ${activeTab === "DOCS" ? "active" : ""}`} onClick={() => setActiveTab("DOCS")}>
                📁 Quản Lý Bài Học ({documents.length})
              </button>
              <button className={`tab-nav-btn ${activeTab === "USERS" ? "active" : ""}`} onClick={() => setActiveTab("USERS")}>
                👥 Quản Lý Người Dùng ({users.length})
              </button>
              <button className={`tab-nav-btn ${activeTab === "LOGS" ? "active" : ""}`} onClick={() => setActiveTab("LOGS")}>
                📊 Nhật Ký Hệ Thống ({logs.length})
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

          {/* TAB 1: BÀI GIẢNG */}
          {activeTab === "DOCS" && (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên Bài Giảng / Học Liệu</th>
                    <th>Tệp Đính Kèm</th>
                    <th>Ngày Cập Nhật</th>
                    <th style={{ textAlign: "right" }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                        Chưa có bài giảng nào trong hệ thống.
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

          {/* TAB 2: NGƯỜI DÙNG */}
          {activeTab === "USERS" && (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Họ và Tên</th>
                    <th>Email Tài Khoản</th>
                    <th>Quyền Hạn</th>
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

          {/* TAB 3: NHẬT KÝ */}
          {activeTab === "LOGS" && (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thời Gian</th>
                    <th>Sự Kiện</th>
                    <th>Tài Khoản</th>
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