"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const [files, setFiles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchDocuments();
    const storedUser = localStorage.getItem("phanthiphuong_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  const fetchDocuments = async () => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setFiles(data);
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Lỗi khi tải tệp xuống!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("phanthiphuong_user");
    window.location.reload();
  };

  const filteredFiles = files.filter(f => f.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#f8fafc" }}>
      {/* HEADER */}
      <header style={{ background: "white", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "900", margin: 0, color: "#1e40af" }}>
          🌟 PHAN THỊ PHƯƠNG
        </h1>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {!user ? (
            <>
              <Link href="/auth/login" style={{ color: "#334155", textDecoration: "none", fontWeight: "bold" }}>Đăng Nhập</Link>
              <Link href="/auth/register" style={{ background: "#2563eb", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>Đăng Ký</Link>
            </>
          ) : (
            <>
              <span style={{ fontWeight: "bold", color: "#334155" }}>👋 Xin chào, {user.username || user.name}</span>
              {user.role === 'admin' && (
                <Link href="/admin" style={{ background: "#10b981", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>
                  ⚙️ Khu Vực Quản Trị
                </Link>
              )}
              <button onClick={handleLogout} style={{ background: "#ef4444", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                Đăng Xuất
              </button>
            </>
          )}
        </div>
      </header>

      {/* TÌM KIẾM */}
      <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "40px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>Kho Học Liệu Số Phan Thị Phương</h2>
        <p style={{ fontSize: "16px", color: "#475569", marginBottom: "30px" }}>Hệ thống lưu trữ bài giảng và tài liệu học tập trực tuyến.</p>
        <input 
          type="text" 
          placeholder="🔍 Tìm kiếm bài giảng..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: "500px", padding: "16px 24px", borderRadius: "50px", border: "1px solid #cbd5e1", fontSize: "16px", outline: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
        />
      </div>

      {/* DANH SÁCH BÀI HỌC */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        {filteredFiles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b", background: "white", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
            Chưa có bài giảng nào trong hệ thống.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {filteredFiles.map((file) => (
              <div key={file.id} style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 4px 6px rgba(0,0,0,0.03)" }}>
                <div style={{ height: "180px", backgroundImage: `url(${file.image_url || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800'})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 10px 0" }}>{file.title}</h3>
                  <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px 0", flex: 1 }}>{file.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                    <span style={{ fontSize: "13px", color: "#475569", fontWeight: "600", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {file.file_name}</span>
                    <button onClick={() => handleDownload(file.file_url, file.file_name)} style={{ background: "#2563eb", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>⬇️ Tải Xuống</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}