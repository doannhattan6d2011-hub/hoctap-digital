"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ============================================================================
// 1. CẤU TRÚC KIỂU DỮ LIỆU TÀI LIỆU VÀ THÀNH VIÊN
// ============================================================================
export interface DocumentItem {
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

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
}

// Kiểu dữ liệu sắp xếp
export type SortOption = "NEWEST" | "OLDEST" | "POPULAR" | "AZ";

// ============================================================================
// 2. STYLESHEET TOÀN DIỆN CHO TRANG CHỦ & BỘ BỘ SẮP XẾP
// ============================================================================
const HomeStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; }
    body { background-color: #f8fafc; color: #0f172a; overflow-x: hidden; }

    /* Header */
    .app-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      position: sticky; top: 0; z-index: 100;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      padding: 16px 40px; display: flex; justify-content: space-between; align-items: center;
    }

    .brand-logo { font-size: 24px; font-weight: 900; color: #1e3a8a; text-decoration: none; display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #2563eb, #1e3a8a); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }

    /* Hero Banner */
    .hero-section {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 80px 24px; text-align: center; color: white; position: relative; overflow: hidden;
    }
    .hero-stats { display: flex; justify-content: center; gap: 40px; margin-top: 40px; }
    .stat-item {
      background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
      padding: 16px 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);
    }
    .stat-num { font-size: 32px; font-weight: 900; }
    .stat-label { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }

    /* Filter Container & Controls */
    .filter-container {
      max-width: 1320px; margin: -30px auto 40px; background: white;
      border-radius: 20px; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      position: relative; z-index: 10; display: flex; flex-direction: column; gap: 20px;
    }

    .search-sort-bar {
      display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
    }

    .search-input {
      flex: 1; min-width: 280px; padding: 16px 24px; border-radius: 12px;
      border: 1px solid #cbd5e1; font-size: 16px; outline: none; background: #f8fafc;
      transition: all 0.2s;
    }
    .search-input:focus { border-color: #2563eb; background: #ffffff; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }

    .sort-select-box {
      display: flex; align-items: center; gap: 10px; background: #f1f5f9;
      padding: 6px 16px; border-radius: 12px; border: 1px solid #cbd5e1;
    }
    .sort-label { font-weight: 800; font-size: 13px; color: #475569; white-space: nowrap; }
    .sort-dropdown {
      border: none; background: transparent; font-weight: 800; font-size: 14px;
      color: #1e3a8a; outline: none; cursor: pointer; padding: 8px 0;
    }

    .filter-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .filter-label { font-weight: 800; color: #1e293b; min-width: 100px; font-size: 15px; }
    
    .filter-btn {
      padding: 10px 20px; border-radius: 50px; border: 1px solid #e2e8f0;
      background: #f8fafc; color: #475569; font-weight: 700; font-size: 14px;
      cursor: pointer; transition: all 0.2s;
    }
    .filter-btn:hover { border-color: #cbd5e1; background: #f1f5f9; }
    .filter-btn.active { background: #2563eb; color: white; border-color: #2563eb; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

    /* Grid & Cards */
    .doc-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px;
      max-width: 1320px; margin: 0 auto; padding: 0 24px 80px;
    }
    .doc-card {
      background: white; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0;
      transition: transform 0.3s, box-shadow 0.3s; display: flex; flex-direction: column;
    }
    .doc-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border-color: #cbd5e1; }
    
    .doc-thumb { height: 180px; background-size: cover; background-position: center; position: relative; }
    .doc-badges { position: absolute; top: 12px; left: 12px; display: flex; gap: 8px; }
    .badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: white; backdrop-filter: blur(4px); }
    .badge-grade { background: rgba(220, 38, 38, 0.85); }
    .badge-cat { background: rgba(37, 99, 235, 0.85); }

    .doc-content { padding: 24px; display: flex; flex-direction: column; flex: 1; }
    .doc-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; line-height: 1.4; }
    .doc-desc { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    
    .doc-actions { display: flex; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; align-items: center; }
    .btn-preview { flex: 1; background: #f1f5f9; color: #334155; padding: 12px; border-radius: 12px; text-align: center; font-weight: 700; cursor: pointer; border: none; transition: 0.2s; }
    .btn-preview:hover { background: #e2e8f0; }
    .btn-download { flex: 1; background: #10b981; color: white; padding: 12px; border-radius: 12px; text-align: center; font-weight: 800; cursor: pointer; border: none; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .btn-download:hover { background: #059669; }
    .btn-download.locked { background: #cbd5e1; color: #64748b; cursor: not-allowed; }

    .doc-meta { font-size: 12px; color: #94a3b8; font-weight: 600; display: flex; justify-content: space-between; margin-top: 16px; }

    /* Modal Preview */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
      z-index: 1000; display: flex; justify-content: center; align-items: center; padding: 40px;
    }
    .modal-content {
      background: white; width: 100%; max-width: 1000px; height: 90vh; border-radius: 24px;
      overflow: hidden; display: flex; flex-direction: column;
    }
    .modal-header { padding: 20px 32px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
    .modal-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
    .btn-close { background: #fef2f2; color: #ef4444; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-weight: bold; font-size: 16px; }
    .modal-body { flex: 1; background: #e2e8f0; position: relative; }
    .preview-iframe { width: 100%; height: 100%; border: none; }
  `}} />
);

// ============================================================================
// 3. MAIN COMPONENT TRANG CHỦ & XỬ LÝ SẮP XẾP / LỌC FILE
// ============================================================================
export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // States Lọc & Sắp xếp
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("Tất cả");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [sortBy, setSortBy] = useState<SortOption>("NEWEST");

  // State Modal Preview
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    checkAuthSession();
    fetchDocumentsAndStats();
  }, []);

  const checkAuthSession = () => {
    const stored = localStorage.getItem("phanthiphuong_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  };

  const fetchDocumentsAndStats = async () => {
    setLoading(true);
    try {
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (docs) setDocuments(docs);

      const { count } = await supabase
        .from("profiles")
        .select('*', { count: 'exact', head: true });
      
      if (count !== null) setTotalUsers(count);

    } catch (err) {
      console.error("Lỗi kết nối cơ sở dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("phanthiphuong_user");
    window.location.reload();
  };

  const handleDownloadFile = async (doc: DocumentItem) => {
    if (!user) {
      alert("🔒 Yêu cầu bảo mật: Vui lòng Đăng nhập để tải tệp tài liệu này!");
      window.location.href = "/auth/login";
      return;
    }

    try {
      // Tăng số lượt tải
      await supabase
        .from('documents')
        .update({ download_count: (doc.download_count || 0) + 1 })
        .eq('id', doc.id);

      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, download_count: (d.download_count || 0) + 1 } : d));

      const res = await fetch(doc.file_url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(doc.file_url, "_blank");
    }
  };

  // Tự động ẩn danh mục trống
  const availableGrades = useMemo(() => {
    const grades = new Set(documents.map(d => d.grade));
    return ["Tất cả", ...Array.from(grades).filter(Boolean)];
  }, [documents]);

  const availableCategories = useMemo(() => {
    const filteredByGrade = selectedGrade === "Tất cả" 
      ? documents 
      : documents.filter(d => d.grade === selectedGrade);
    
    const categories = new Set(filteredByGrade.map(d => d.category));
    return ["Tất cả", ...Array.from(categories).filter(Boolean)];
  }, [documents, selectedGrade]);

  // LOGIC SẮP XẾP & LỌC TÀI LIỆU CHÍNH XÁC
  const filteredAndSortedDocs = useMemo(() => {
    let result = documents.filter(doc => {
      const matchGrade = selectedGrade === "Tất cả" || doc.grade === selectedGrade;
      const matchCat = selectedCategory === "Tất cả" || doc.category === selectedCategory;
      const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || doc.file_name.toLowerCase().includes(search.toLowerCase());
      return matchGrade && matchCat && matchSearch;
    });

    // Xử lý Sắp Xếp File
    return result.sort((a, b) => {
      if (sortBy === "NEWEST") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "OLDEST") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "POPULAR") {
        return (b.download_count || 0) - (a.download_count || 0);
      }
      if (sortBy === "AZ") {
        return a.title.localeCompare(b.title, "vi");
      }
      return 0;
    });
  }, [documents, selectedGrade, selectedCategory, search, sortBy]);

  const totalDownloads = documents.reduce((sum, doc) => sum + (doc.download_count || 0), 0);

  return (
    <>
      <HomeStyles />
      
      {/* HEADER */}
      <header className="app-header">
        <Link href="/" className="brand-logo">
          <div className="brand-icon">P</div>
          PHAN THỊ PHƯƠNG
        </Link>
        
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {!user ? (
            <>
              <Link href="/auth/login" style={{ color: "#334155", textDecoration: "none", fontWeight: "800" }}>Đăng Nhập</Link>
              <Link href="/auth/register" style={{ background: "#2563eb", color: "white", padding: "10px 24px", borderRadius: "50px", textDecoration: "none", fontWeight: "800" }}>Đăng Ký Tài Khoản</Link>
            </>
          ) : (
            <>
              <span style={{ fontWeight: "800", color: "#334155", background: "#f1f5f9", padding: "8px 16px", borderRadius: "50px" }}>
                👋 {user.username}
              </span>
              {user.role === "admin" && (
                <Link href="/admin" style={{ background: "#10b981", color: "white", padding: "10px 20px", borderRadius: "12px", textDecoration: "none", fontWeight: "800" }}>
                  ⚙️ Quản Trị Hệ Thống
                </Link>
              )}
              <Link href="/auth/change-password" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "800", fontSize: "14px" }}>
                🔐 Đổi Mật Khẩu
              </Link>
              <button onClick={handleLogout} style={{ background: "#fef2f2", color: "#ef4444", padding: "10px 20px", borderRadius: "12px", border: "1px solid #fecaca", cursor: "pointer", fontWeight: "800" }}>
                Đăng Xuất
              </button>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <h1 style={{ fontSize: "48px", fontWeight: "900", marginBottom: "16px", letterSpacing: "-1px" }}>
          Kho Học Liệu Số Phan Thị Phương
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9, maxWidth: "600px", margin: "0 auto" }}>
          Lưu trữ, quản lý và chia sẻ giáo án, bài giảng điện tử chuẩn hóa.
        </p>
        
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-num">{documents.length}</div>
            <div className="stat-label">Tài Liệu</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{totalDownloads}</div>
            <div className="stat-label">Lượt Tải</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{totalUsers}</div>
            <div className="stat-label">Thành Viên</div>
          </div>
        </div>
      </section>

      {/* BỘ LỌC VÀ SẮP XẾP CHI TIẾT */}
      <div className="filter-container">
        <div className="search-sort-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Tìm kiếm bài giảng, giáo án, từ khóa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="sort-select-box">
            <span className="sort-label">⇅ SẮP XẾP FILE:</span>
            <select
              className="sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="NEWEST">✨ Mới nhất cập nhật</option>
              <option value="POPULAR">🔥 Lượt tải nhiều nhất</option>
              <option value="AZ">🔤 Tên bài từ A đến Z</option>
              <option value="OLDEST">📜 Cũ nhất trước đó</option>
            </select>
          </div>
        </div>
        
        <div className="filter-row">
          <div className="filter-label">📚 Cấp Lớp:</div>
          {availableGrades.map(grade => (
            <button 
              key={grade} 
              onClick={() => { setSelectedGrade(grade); setSelectedCategory("Tất cả"); }}
              className={`filter-btn ${selectedGrade === grade ? "active" : ""}`}
            >
              {grade}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <div className="filter-label">📑 Danh Mục:</div>
          {availableCategories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DANH SÁCH FILE */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", fontSize: "20px", fontWeight: "800", color: "#2563eb" }}>
          ⏳ Đang sắp xếp và nạp danh sách tài liệu...
        </div>
      ) : filteredAndSortedDocs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#64748b", background: "white", margin: "0 auto", maxWidth: "800px", borderRadius: "24px", border: "2px dashed #e2e8f0" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📂</div>
          <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "0 0 8px 0" }}>Khung thư mục này chưa có tài liệu</h3>
          <p>Thử đổi bộ lọc hoặc chọn Sắp xếp theo Mới nhất.</p>
        </div>
      ) : (
        <div className="doc-grid">
          {filteredAndSortedDocs.map((doc) => (
            <div key={doc.id} className="doc-card">
              <div className="doc-thumb" style={{ backgroundImage: `url(${doc.image_url || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800'})` }}>
                <div className="doc-badges">
                  {doc.grade && <span className="badge badge-grade">{doc.grade}</span>}
                  {doc.category && <span className="badge badge-cat">{doc.category}</span>}
                </div>
              </div>
              
              <div className="doc-content">
                <h3 className="doc-title">{doc.title}</h3>
                <p className="doc-desc">{doc.description}</p>
                
                <div className="doc-actions">
                  <button onClick={() => setPreviewDoc(doc)} className="btn-preview">
                    👁️ Xem Trước
                  </button>
                  <button 
                    onClick={() => handleDownloadFile(doc)} 
                    className={`btn-download ${!user ? "locked" : ""}`}
                  >
                    {!user ? "🔒 Đăng Nhập Để Tải" : "⬇️ Tải Xuống"}
                  </button>
                </div>

                <div className="doc-meta">
                  <span>📄 {doc.file_name.split('.').pop()?.toUpperCase()}</span>
                  <span>📥 {doc.download_count || 0} lượt tải</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PREVIEW */}
      {previewDoc && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setPreviewDoc(null); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Bản xem trước: {previewDoc.title}</h3>
              <button className="btn-close" onClick={() => setPreviewDoc(null)}>✕</button>
            </div>
            <div className="modal-body">
              <iframe 
                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewDoc.file_url)}&embedded=true`} 
                className="preview-iframe"
                title="Preview"
              ></iframe>
              {!user && (
                <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", background: "rgba(30, 58, 138, 0.95)", color: "white", padding: "16px", textAlign: "center", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: "700" }}>🔒 Bản xem trước giới hạn. Đăng nhập để tải toàn bộ file.</div>
                  <Link href="/auth/login" style={{ background: "#10b981", color: "white", padding: "10px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: "800" }}>Đăng Nhập Ngay</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}