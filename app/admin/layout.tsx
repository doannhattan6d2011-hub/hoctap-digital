"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ============================================================================
// 1. HỆ THỐNG KIỂU DỮ LIỆU BẢO MẬT (TYPESCRIPT)
// ============================================================================
export interface AdminUserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

// ============================================================================
// 2. KHO ICON SVG CHUYÊN NGHIỆP DÀNH CHO ADMIN
// ============================================================================
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Documents: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
};

// ============================================================================
// 3. DANH SÁCH MENU QUẢN TRỊ
// ============================================================================
const adminNavItems: NavItem[] = [
  { name: "Bảng Điều Khiển", path: "/admin", icon: <Icons.Dashboard /> },
  { name: "Đăng Tải Bài Mới", path: "/admin/new", icon: <Icons.Upload /> },
  { name: "Quản Lý Người Dùng", path: "/admin/users", icon: <Icons.Users /> },
];

// ============================================================================
// 4. CSS-IN-JS BỌC TOÀN BỘ KHUNG GIAO DIỆN ADMIN (RẤT CHI TIẾT)
// ============================================================================
const AdminLayoutStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    :root {
      --admin-bg: #f8fafc;
      --admin-sidebar: #ffffff;
      --admin-primary: #2563eb;
      --admin-primary-hover: #1d4ed8;
      --admin-text-main: #0f172a;
      --admin-text-muted: #64748b;
      --admin-border: #e2e8f0;
    }

    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    
    body {
      margin: 0; padding: 0; background-color: var(--admin-bg); overflow: hidden;
    }

    /* Bố cục chính */
    .admin-layout-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: var(--admin-bg);
    }

    /* THANH BÊN (SIDEBAR) */
    .sidebar {
      width: 280px;
      background: var(--admin-sidebar);
      border-right: 1px solid var(--admin-border);
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
      z-index: 50;
      box-shadow: 4px 0 15px rgba(0,0,0,0.02);
    }

    .sidebar-header {
      height: 80px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      border-bottom: 1px solid var(--admin-border);
    }

    .sidebar-logo-text {
      font-size: 20px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: -0.5px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 24px 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      border-radius: 12px;
      color: var(--admin-text-muted);
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      background: #f1f5f9;
      color: var(--admin-primary);
    }

    .nav-link.active {
      background: var(--admin-primary);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    .sidebar-footer {
      padding: 24px 16px;
      border-top: 1px solid var(--admin-border);
    }

    /* KHU VỰC NỘI DUNG CHÍNH */
    .main-content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      overflow: hidden;
    }

    /* THANH TRÊN (TOPBAR) */
    .topbar {
      height: 80px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--admin-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      z-index: 40;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      color: var(--admin-text-main);
      cursor: pointer;
      padding: 8px;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .user-profile-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f1f5f9;
      padding: 6px 16px 6px 6px;
      border-radius: 50px;
      border: 1px solid var(--admin-border);
    }

    .avatar-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--admin-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
    }

    /* KHUNG HIỂN THỊ NỘI DUNG */
    .main-viewport {
      flex: 1;
      overflow-y: auto;
      padding: 0;
      background: var(--admin-bg);
      position: relative;
    }

    /* Responsive Mobile */
    @media (max-width: 1024px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .mobile-menu-btn {
        display: block;
      }
      .sidebar-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        z-index: 45;
        display: none;
      }
      .sidebar-overlay.open {
        display: block;
      }
    }
  `}} />
);

// ============================================================================
// 5. COMPONENT GỐC: ADMIN LAYOUT (BỌC TẤT CẢ CÁC TRANG TRONG /ADMIN)
// ============================================================================
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Kịch bản bảo mật: Bắt buộc kiểm tra quyền truy cập ngay khi bọc Layout
  useEffect(() => {
    const verifyAdminAccess = () => {
      try {
        const storedUser = localStorage.getItem("phanthiphuong_user");
        
        if (!storedUser) {
          router.push("/auth/login");
          return;
        }

        const user: AdminUserProfile = JSON.parse(storedUser);

        // Khóa bảo mật 2 lớp: Bắt buộc phải là Admin
        if (user.role !== "admin" && !user.email.includes("admin") && !user.email.includes("phanthiphuong")) {
          alert("⛔ TỪ CHỐI TRUY CẬP: Khu vực này chỉ dành riêng cho Admin Phan Thị Phương.");
          router.push("/");
          return;
        }

        // Đồng bộ dữ liệu hiển thị
        setAdminUser(user);
        setAuthChecking(false);

      } catch (error) {
        console.error("Lỗi xác thực:", error);
        localStorage.removeItem("phanthiphuong_user");
        router.push("/auth/login");
      }
    };

    verifyAdminAccess();
  }, [router]);

  // Đóng sidebar trên mobile khi chuyển trang
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("phanthiphuong_user");
    router.push("/auth/login");
  };

  // Màn hình chống kẹt tức thì (Tránh lỗi vỡ layout)
  if (authChecking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#1e3a8a", fontWeight: "900" }}>🛡️ Đang kiểm tra bảo mật...</h2>
      </div>
    );
  }

  return (
    <>
      <AdminLayoutStyles />
      
      <div className="admin-layout-container">
        
        {/* Lớp phủ màn hình tối cho điện thoại */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`} 
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        {/* CỘT MENU BÊN TRÁI (SIDEBAR) */}
        <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <Link href="/admin" className="sidebar-logo-text">
              <div style={{ width: "36px", height: "36px", background: "#2563eb", color: "white", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                P
              </div>
              PHAN THỊ PHƯƠNG
            </Link>
          </div>

          <nav className="sidebar-nav">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <Link href="/" className="nav-link" style={{ marginBottom: "8px" }}>
              <Icons.Home />
              Trở Về Trang Chủ
            </Link>
            <button 
              onClick={handleLogout} 
              className="nav-link" 
              style={{ width: "100%", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", cursor: "pointer" }}
            >
              <Icons.Logout />
              Đăng Xuất
            </button>
          </div>
        </aside>

        {/* KHU VỰC BÊN PHẢI (MAIN CONTENT) */}
        <div className="main-content-wrapper">
          
          {/* THANH ĐIỀU HƯỚNG TRÊN (TOPBAR) */}
          <header className="topbar">
            <div className="topbar-left">
              <button 
                className="mobile-menu-btn" 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Icons.Menu />
              </button>
              
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Trung Tâm Quản Trị
                </h2>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>
                  Hệ thống bảo mật dữ liệu an toàn 100%
                </div>
              </div>
            </div>

            <div className="topbar-right">
              <button style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", position: "relative" }}>
                <Icons.Bell />
                <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "10px", height: "10px", background: "#ef4444", borderRadius: "50%", border: "2px solid white" }}></span>
              </button>

              <div className="user-profile-badge">
                <div className="avatar-circle">
                  {adminUser?.username?.charAt(0).toUpperCase() || "P"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", paddingRight: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", lineHeight: "1" }}>
                    {adminUser?.username || "Phan Thị Phương"}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", marginTop: "4px" }}>
                    QUẢN TRỊ VIÊN
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* KHUNG HIỂN THỊ CÁC TRANG CON (TRÁI TIM CỦA LAYOUT) */}
          <main className="main-viewport">
            {children}
          </main>
          
        </div>
      </div>
    </>
  );
}