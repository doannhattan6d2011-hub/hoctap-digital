"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

// ============================================================================
// 1. CSS TOÀN CỤC & HIỆU ỨNG (ANIMATIONS & HOVERS)
// ============================================================================
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
    body { background-color: #f8fafc; color: #0f172a; overflow-x: hidden; }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

    /* Hiệu ứng Glassmorphism cho Menu */
    .glass-header {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
      position: sticky; top: 0; z-index: 50;
      transition: all 0.3s ease;
    }
    .glass-header.scrolled {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.95);
    }

    /* Hiệu ứng gạch chân khi hover Menu */
    .nav-link {
      position: relative; color: #475569; font-weight: 600; text-decoration: none;
      padding: 8px 4px; transition: color 0.3s;
    }
    .nav-link:hover { color: #2563eb; }
    .nav-link::after {
      content: ''; position: absolute; width: 0; height: 3px;
      bottom: 0; left: 0; background-color: #2563eb; border-radius: 2px;
      transition: width 0.3s ease-in-out;
    }
    .nav-link:hover::after { width: 100%; }

    /* Nút bấm Gradient */
    .btn-gradient {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      color: white; border: none; padding: 10px 24px; border-radius: 8px;
      font-weight: 700; cursor: pointer; transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }
    .btn-gradient:hover {
      transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
    }

    /* Card hiệu ứng 3D */
    .doc-card {
      background: white; border-radius: 16px; overflow: hidden;
      border: 1px solid #e2e8f0; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex; flex-direction: column;
    }
    .doc-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border-color: #cbd5e1;
    }
    .doc-card .img-container { transition: transform 0.5s ease; }
    .doc-card:hover .img-container { transform: scale(1.05); }

    /* Dropdown Animation */
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dropdown-menu { animation: slideDown 0.2s ease-out forwards; }
    
    /* Hero Background */
    .hero-bg {
      background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
      position: relative; overflow: hidden;
    }
    .hero-shape {
      position: absolute; border-radius: 50%; filter: blur(60px); z-index: 0;
    }
  `}} />
);

// ============================================================================
// 2. BỘ ICON SVG CHUYÊN NGHIỆP (Tối ưu sắc nét)
// ============================================================================
const Icons = {
  Logo: () => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#2563EB"/><path d="M9 16L14 21L23 11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  File: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
};

// ============================================================================
// 3. DATABASE & TYPES (Lõi xử lý dữ liệu chuẩn xác)
// ============================================================================
export interface DocumentItem {
  id: string; title: string; description: string; imageUrl: string; fileName: string; fileData?: string; createdAt: string;
}
export interface UserItem { email: string; username: string; role: string; name?: string; }

const DOCS_KEY = "hoctap_digital_docs";
const USERS_KEY = "mock_users";

export const Database = {
  getDocuments: (): DocumentItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(DOCS_KEY);
      if (data) return JSON.parse(data);
      const demoData: DocumentItem[] = [
        {
          id: "demo-1", title: "Giáo Án: Đất Rừng Phương Nam", description: "Bộ giáo án chi tiết kết hợp hình ảnh trực quan sinh động.", imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800", fileName: "GiaoAn_DatRung.docx", createdAt: new Date().toISOString()
        },
        {
          id: "demo-2", title: "Bài Giảng Điện Tử: Cây Khế", description: "Trọn bộ trình chiếu PowerPoint chất lượng cao dành cho giáo viên Ngữ Văn.", imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800", fileName: "BaiGiang_CayKhe.pptx", createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(DOCS_KEY, JSON.stringify(demoData));
      return demoData;
    } catch { return []; }
  },
  getUsers: (): UserItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }
};

// ============================================================================
// 4. COMPONENT: TOAST NOTIFICATION (Thông báo chuyên nghiệp)
// ============================================================================
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, background: type === 'success' ? '#10b981' : '#ef4444', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', animation: 'slideDown 0.3s ease-out' }}>
      {type === 'success' ? '✅' : '⚠️'} {message}
    </div>
  );
};

// ============================================================================
// 5. COMPONENT CHÍNH: HOMEPAGE TÍCH HỢP GIAO DIỆN MỚI
// ============================================================================
export default function HomePage() {
  const [files, setFiles] = useState<DocumentItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Trạng thái User
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  
  // Trạng thái UI
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"documents" | "users">("documents");
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  // Hook theo dõi thao tác
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFiles(Database.getDocuments());
    setUsers(Database.getUsers());
    setMounted(true);

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setIsLoggedIn(true);
        setCurrentUser(user);
        if (user.role === "admin") setIsAdmin(true);
      } catch (e) { console.error(e); }
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!mounted) return null;

  const filteredFiles = files.filter(f => f.title.toLowerCase().includes(search.toLowerCase()));

  // Xử lý Tải File an toàn
  const handleDownload = (doc: DocumentItem) => {
    try {
      if (doc.fileData) {
        const link = document.createElement("a");
        link.href = doc.fileData; link.download = doc.fileName;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
      } else {
        const fileContent = `Nội dung giả lập hệ thống cho file: ${doc.fileName}`;
        const blob = new Blob([fileContent], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = doc.fileName;
        document.body.appendChild(link); link.click();
        document.body.removeChild(link); window.URL.revokeObjectURL(url);
      }
      setToast({ msg: `Đã tải xuống thành công: ${doc.fileName}`, type: 'success' });
    } catch {
      setToast({ msg: 'Có lỗi xảy ra khi tải file!', type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_info");
    setToast({ msg: 'Đăng xuất thành công!', type: 'success' });
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <>
      <GlobalStyles />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ================= HEADER SIÊU ĐẸP ================= */}
      <header className={`glass-header ${isScrolled ? 'scrolled' : ''}`}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }} onClick={() => setViewMode("documents")}>
            <Icons.Logo />
            <span style={{ fontSize: '22px', fontWeight: '900', background: 'linear-gradient(90deg, #0f172a 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              HọcTập Digital
            </span>
          </Link>

          {/* Desktop Menu */}
          <div style={{ display: 'none', gap: '32px', alignItems: 'center' }} className="desktop-menu">
            <Link href="/" className="nav-link" onClick={() => setViewMode("documents")}>Trang Chủ</Link>
            <Link href="#" className="nav-link">Kho Tài Liệu</Link>
            <Link href="#" className="nav-link">Giới Thiệu</Link>
          </div>
          
          {/* Inject inline media query for desktop menu */}
          <style>{`@media(min-width: 768px) { .desktop-menu { display: flex !important; } .mobile-btn { display: none !important; } }`}</style>

          {/* User Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!isLoggedIn ? (
              <div style={{ display: 'none', gap: '12px' }} className="desktop-menu">
                <Link href="/auth/login" style={{ padding: '10px 20px', color: '#334155', fontWeight: '700', textDecoration: 'none', transition: '0.2s' }}>Đăng Nhập</Link>
                <Link href="/auth/register" className="btn-gradient" style={{ textDecoration: 'none' }}>Đăng Ký Miễn Phí</Link>
              </div>
            ) : (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 16px 6px 6px', borderRadius: '50px', cursor: 'pointer', transition: '0.2s' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{currentUser?.name || currentUser?.username}</span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="dropdown-menu" style={{ position: 'absolute', top: '120%', right: '0', width: '240px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 100 }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                      <p style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>{currentUser?.email}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Vai trò: <span style={{ color: isAdmin ? '#b45309' : '#0284c7', fontWeight: 'bold' }}>{currentUser?.role.toUpperCase()}</span></p>
                    </div>
                    <div style={{ padding: '8px' }}>
                      {isAdmin && (
                        <>
                          <button onClick={() => { setViewMode("users"); setShowDropdown(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontWeight: '600', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                            <Icons.User /> Quản lý Người dùng
                          </button>
                          <Link href="/admin" style={{ width: '100%', padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontWeight: '600', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                            <Icons.Dashboard /> Bảng Điều Khiển
                          </Link>
                        </>
                      )}
                      <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', fontWeight: '600', borderRadius: '6px', marginTop: '4px' }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                        <Icons.Logout /> Đăng Xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button className="mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer' }}>
              {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid #e2e8f0', background: 'white', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideDown 0.3s ease' }}>
            <Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link>
            {!isLoggedIn && (
              <>
                <Link href="/auth/login" className="nav-link">Đăng Nhập</Link>
                <Link href="/auth/register" className="nav-link" style={{ color: '#2563eb' }}>Đăng Ký Miễn Phí</Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      {viewMode === "documents" && (
        <section className="hero-bg" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div className="hero-shape" style={{ width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.15)', top: '-100px', left: '-100px' }}></div>
          <div className="hero-shape" style={{ width: '500px', height: '500px', background: 'rgba(56, 189, 248, 0.15)', bottom: '-150px', right: '-100px' }}></div>
          
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ display: 'inline-block', padding: '8px 16px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '50px', fontWeight: '700', fontSize: '14px', marginBottom: '24px', letterSpacing: '0.5px' }}>
              NỀN TẢNG HỌC LIỆU SỐ HÀNG ĐẦU 🌟
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '900', color: '#0f172a', lineHeight: '1.2', marginBottom: '24px' }}>
              Khám Phá Tri Thức <br/><span style={{ color: '#2563eb' }}>Không Giới Hạn</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Truy cập và tải xuống hàng ngàn bài giảng, giáo án và tài liệu tham khảo chất lượng cao được kiểm duyệt chặt chẽ.
            </p>

            {/* Thanh Tìm Kiếm Đẹp Mắt */}
            <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto', display: 'flex', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderRadius: '50px', overflow: 'hidden', background: 'white', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '16px 12px 16px 24px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}><Icons.Search /></div>
              <input 
                type="text" 
                placeholder="Nhập tên bài giảng, môn học..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', padding: '16px 0', fontSize: '16px', color: '#0f172a' }}
              />
              <button className="btn-gradient" style={{ borderRadius: '0', padding: '0 32px' }}>Tìm Kiếm</button>
            </div>
          </div>
        </section>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 10 }}>
        
        {/* VIEW: KHO HỌC LIỆU */}
        {viewMode === "documents" && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Học Liệu Mới Nhất</h2>
              <span style={{ color: '#64748b', fontWeight: '600' }}>Hiển thị {filteredFiles.length} kết quả</span>
            </div>

            {filteredFiles.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: "24px", border: "2px dashed #cbd5e1" }}>
                <div style={{ color: '#94a3b8', marginBottom: '16px' }}><Icons.Search /></div>
                <h3 style={{ color: "#475569", fontSize: '20px', margin: '0 0 8px 0' }}>Không tìm thấy học liệu!</h3>
                <p style={{ color: '#94a3b8' }}>Thử tìm kiếm với một từ khóa khác xem sao.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }}>
                {filteredFiles.map((file) => (
                  <div key={file.id} className="doc-card">
                    {/* Phần Ảnh Bìa */}
                    <div style={{ overflow: 'hidden', height: '220px', position: 'relative' }}>
                      <div className="img-container" style={{ width: '100%', height: '100%', backgroundImage: `url(${file.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                      <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '800', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)' }}>
                        <Icons.File /> {file.fileName.split('.').pop()?.toUpperCase()}
                      </div>
                    </div>
                    
                    {/* Phần Nội Dung */}
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px 0", lineHeight: "1.5" }}>{file.title}</h3>
                      <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.7", margin: "0 0 24px 0", flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {file.description}
                      </p>
                      
                      {/* Cụm chức năng */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "20px", marginTop: 'auto' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Tên tệp đính kèm</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#0f172a', fontWeight: '600', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.fileName}</p>
                        </div>
                        <button 
                          onClick={() => handleDownload(file)} 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: "10px 20px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "8px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                          onMouseOver={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.color = 'white'; }}
                          onMouseOut={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#16a34a'; }}
                        >
                          <Icons.Download /> Tải Về
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* VIEW: QUẢN LÝ NGƯỜI DÙNG (ADMIN ONLY) */}
        {viewMode === "users" && isAdmin && (
          <div style={{ background: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.02)", border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: "32px", borderBottom: "2px solid #f1f5f9", paddingBottom: "24px" }}>
              <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '12px', borderRadius: '12px' }}><Icons.User /></div>
              <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: 0 }}>Hệ Thống Thành Viên</h2>
            </div>
            
            {users.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#64748b", background: '#f8fafc', borderRadius: '16px' }}>Chưa có thành viên nào đăng ký.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                      <th style={{ padding: "20px", borderBottom: "2px solid #e2e8f0", color: '#475569', fontWeight: '700' }}>Tài Khoản</th>
                      <th style={{ padding: "20px", borderBottom: "2px solid #e2e8f0", color: '#475569', fontWeight: '700' }}>Email Liên Hệ</th>
                      <th style={{ padding: "20px", borderBottom: "2px solid #e2e8f0", color: '#475569', fontWeight: '700' }}>Phân Quyền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr key={idx} style={{ transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                        <td style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", fontWeight: "700", color: '#0f172a' }}>{u.username}</td>
                        <td style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", color: "#64748b", fontWeight: '500' }}>{u.email}</td>
                        <td style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ padding: "6px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: "800", background: u.role === "admin" ? "#fef3c7" : "#e0f2fe", color: u.role === "admin" ? "#b45309" : "#0369a1", border: `1px solid ${u.role === "admin" ? '#fde68a' : '#bae6fd'}` }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '60px 24px 24px', marginTop: '60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icons.Logo />
            <span style={{ fontSize: '24px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>HọcTập Digital</span>
          </div>
          <p style={{ maxWidth: '500px', lineHeight: '1.6' }}>Nền tảng chia sẻ học liệu số, giáo án và bài giảng điện tử hàng đầu dành cho giáo viên và học sinh toàn quốc.</p>
          <div style={{ borderTop: '1px solid #1e293b', width: '100%', paddingTop: '24px', marginTop: '24px', fontSize: '14px' }}>
            © {new Date().getFullYear()} HọcTập Digital. Đã đăng ký bản quyền.
          </div>
        </div>
      </footer>
    </>
  );
}