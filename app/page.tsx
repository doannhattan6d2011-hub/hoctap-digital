"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ============================================================================
// HỆ THỐNG KIỂU DỮ LIỆU & INTERFACE
// ============================================================================
export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  file_name: string;
  file_url: string;
  created_at: string;
  category?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface ToastNotice {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

// ============================================================================
// STYLESHEET TOÀN CỤC (CSS-IN-JS HOÀN CHỈNH)
// ============================================================================
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; }
    body { background-color: #f8fafc; color: #0f172a; overflow-x: hidden; }

    .header-glass {
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      position: sticky; top: 0; z-index: 100;
      transition: all 0.3s ease;
    }
    .header-glass.scrolled {
      box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.08);
      background: rgba(255, 255, 255, 0.96);
    }

    .hero-banner {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
      position: relative; overflow: hidden; color: white;
    }
    .hero-banner::before {
      content: ''; position: absolute; width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
      top: -200px; right: -100px; border-radius: 50%; pointer-events: none;
    }

    .doc-card {
      background: #ffffff; border-radius: 20px;
      border: 1px solid #e2e8f0; overflow: hidden;
      display: flex; flex-direction: column;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
    }
    .doc-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
      border-color: #cbd5e1;
    }

    .btn-primary {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white; border: none; padding: 12px 24px; border-radius: 12px;
      font-weight: 700; cursor: pointer; transition: all 0.25s ease;
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
    }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(6px); z-index: 200;
      display: flex; align-items: center; justify-content: center; padding: 20px;
      animation: fadeIn 0.25s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .toast-container {
      position: fixed; bottom: 24px; right: 24px; z-index: 300;
      display: flex; flex-direction: column; gap: 10px;
    }
  `}} />
);

// ============================================================================
// BỘ ICON SVG CHUYÊN NGHIỆP
// ============================================================================
const Icons = {
  Logo: () => <svg width="34" height="34" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="10" fill="#2563EB"/><path d="M10 22V10L18 16L10 22Z" fill="white"/><path d="M18 10H22V22H18V10Z" fill="white" opacity="0.8"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Download: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Shield: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  File: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
};

// ============================================================================
// MAIN COMPONENT: HOMEPAGE
// ============================================================================
export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Khởi tạo và kiểm tra bộ nhớ local
  useEffect(() => {
    fetchDocuments();
    checkUserSession();

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const newToast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3500);
  };

  const checkUserSession = () => {
    const stored = localStorage.getItem("phanthiphuong_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.email?.includes("admin") || parsed.email?.includes("phanthiphuong")) {
          parsed.role = "admin";
          parsed.username = "Phan Thị Phương";
          localStorage.setItem("phanthiphuong_user", JSON.stringify(parsed));
        }
        setUser(parsed);
      } catch (e) {
        console.error("Lỗi parse thông tin tài khoản:", e);
      }
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setDocuments(data);
    } catch (err: any) {
      showToast("Không thể kết nối đến máy chủ dữ liệu!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (doc: DocumentItem) => {
    setDownloadingId(doc.id);
    try {
      const response = await fetch(doc.file_url);
      if (!response.ok) throw new Error("HTTP error " + response.status);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      showToast(`Đã tải xuống thành công: ${doc.file_name}`, "success");
    } catch (err) {
      window.open(doc.file_url, "_blank");
      showToast("Đã mở tệp đính kèm ở cửa sổ mới", "info");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("phanthiphuong_user");
    setUser(null);
    showToast("Đã đăng xuất khỏi hệ thống", "info");
  };

  // Lọc bài học theo tìm kiếm
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
                          doc.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <GlobalStyles />

      {/* TOAST NOTIFICATIONS */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "14px 20px",
              borderRadius: "12px",
              background: t.type === "success" ? "#0f766e" : t.type === "error" ? "#b91c1c" : "#1e40af",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"} {t.message}
          </div>
        ))}
      </div>

      {/* HEADER TỔNG */}
      <header className={`header-glass ${isScrolled ? "scrolled" : ""}`}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <Icons.Logo />
            <div>
              <span style={{ fontSize: "20px", fontWeight: "900", color: "#1e3a8a", letterSpacing: "-0.5px", display: "block", lineHeight: "1" }}>
                PHAN THỊ PHƯƠNG
              </span>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Kho Học Liệu Số Trực Tuyến
              </span>
            </div>
          </Link>

          {/* THANH ĐIỀU HƯỚNG TÀI KHOẢN */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {!user ? (
              <div style={{ display: "flex", gap: "10px" }}>
                <Link href="/auth/login" style={{ padding: "10px 20px", color: "#334155", fontWeight: "700", textDecoration: "none", fontSize: "14px" }}>
                  Đăng Nhập
                </Link>
                <Link href="/auth/register" className="btn-primary" style={{ textDecoration: "none", fontSize: "14px" }}>
                  Đăng Ký
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a" }}>{user.username}</div>
                  <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700" }}>{user.role === "admin" ? "QUẢN TRỊ VIÊN" : "THÀNH VIÊN"}</div>
                </div>

                {user.role === "admin" && (
                  <Link href="/admin" style={{ background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1", padding: "10px 18px", borderRadius: "10px", fontWeight: "700", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Icons.Shield /> Quản Trị
                  </Link>
                )}

                <button onClick={handleLogout} style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "10px", borderRadius: "10px", cursor: "pointer" }} title="Đăng xuất">
                  <Icons.Logout />
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* HERO BANNER BẮT MẮT */}
      <section className="hero-banner" style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <span style={{ background: "rgba(255, 255, 255, 0.2)", padding: "8px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase", display: "inline-block", marginBottom: "20px" }}>
            HỆ THỐNG QUẢN LÝ & CHIA SẺ BÀI GIẢNG
          </span>
          <h1 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: "900", lineHeight: "1.25", marginBottom: "20px" }}>
            Học Liệu Số Ngữ Văn & Giáo Dục <br/> Cô Phan Thị Phương
          </h1>
          <p style={{ fontSize: "18px", opacity: 0.9, lineHeight: "1.6", marginBottom: "36px" }}>
            Nền tảng lưu trữ bài giảng điện tử, giáo án chuẩn hóa và tài liệu học tập dành cho học sinh và giáo viên.
          </p>

          {/* BỘ TÌM KIẾM TRỰC TIẾP */}
          <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative", background: "white", borderRadius: "16px", padding: "8px", display: "flex", alignItems: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "0 16px", color: "#94a3b8", display: "flex" }}><Icons.Search /></div>
            <input
              type="text"
              placeholder="Nhập tên bài học, giáo án, từ khóa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", fontSize: "16px", color: "#0f172a", padding: "12px 0" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "8px 12px" }}>
                <Icons.Close />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* DANH SÁCH BÀI GIẢNG / HỌC LIỆU */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px" }}>
          <div>
            <h2 style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>Kho Tài Liệu Học Tập</h2>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>Hiển thị {filteredDocs.length} bài học có sẵn trên hệ thống</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#64748b", fontWeight: "600" }}>
            ⏳ Đang tải danh sách bài học từ máy chủ...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: "24px", border: "2px dashed #e2e8f0" }}>
            <h3 style={{ fontSize: "20px", color: "#475569", marginBottom: "8px" }}>Không tìm thấy tài liệu phù hợp</h3>
            <p style={{ color: "#94a3b8" }}>Thử tìm kiếm với tên tệp hoặc từ khóa khác</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="doc-card">
                <div style={{ height: "190px", backgroundImage: `url(${doc.image_url || "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800"})`, backgroundSize: "cover", backgroundPosition: "center", borderBottom: "1px solid #f1f5f9", position: "relative" }}>
                  <span style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Icons.File /> {doc.file_name.split('.').pop() || "FILE"}
                  </span>
                </div>

                <div style={{ padding: "22px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "10px", lineHeight: "1.4" }}>
                    {doc.title}
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {doc.description}
                  </p>

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ maxWidth: "160px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Tệp tin</div>
                      <div style={{ fontSize: "13px", color: "#334155", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.file_name}</div>
                    </div>

                    <button
                      onClick={() => handleDownloadFile(doc)}
                      disabled={downloadingId === doc.id}
                      className="btn-primary"
                      style={{ padding: "10px 18px", fontSize: "13px" }}
                    >
                      {downloadingId === doc.id ? "⏳..." : <><Icons.Download /> Tải Về</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER BẢN QUYỀN */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "48px 24px 24px", marginTop: "80px", textAlign: "center" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <Icons.Logo />
          <h3 style={{ color: "white", fontSize: "20px", fontWeight: "900", margin: 0 }}>HỌC TẬP DIGITAL - PHAN THỊ PHƯƠNG</h3>
          <p style={{ maxWidth: "500px", fontSize: "14px", lineHeight: "1.6" }}>
            Hệ thống lưu trữ học liệu trực tuyến phục vụ công tác giảng dạy và học tập chất lượng cao.
          </p>
          <div style={{ borderTop: "1px solid #1e293b", width: "100%", paddingTop: "24px", marginTop: "16px", fontSize: "13px" }}>
            © {new Date().getFullYear()} PHAN THỊ PHƯƠNG. Bản quyền thuộc về tác giả.
          </div>
        </div>
      </footer>
    </>
  );
}