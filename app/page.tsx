"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Tải thông tin người dùng từ LocalStorage
    const stored = localStorage.getItem("phanthiphuong_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.email?.includes("admin") || parsed.email?.includes("phanthiphuong")) {
          parsed.role = "admin";
          parsed.username = "Phan Thị Phương";
        }
        setUser(parsed);
      } catch (e) {}
    }

    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setDocuments(data);
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(fileUrl, "_blank");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("phanthiphuong_user");
    window.location.reload();
  };

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#f8fafc" }}>
      {/* HEADER */}
      <header style={{ background: "white", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #e2e8f0" }}>
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
              <span style={{ fontWeight: "bold", color: "#334155" }}>👋 {user.username}</span>
              {user.role === "admin" && (
                <Link href="/admin" style={{ background: "#10b981", color: "white", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
                  ⚙️ Khu Vực Quản Trị
                </Link>
              )}
              <button onClick={handleLogout} style={{ background: "#ef4444", color: "white", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                Đăng Xuất
              </button>
            </>
          )}
        </div>
      </header>

      {/* BANNER TÌM KIẾM */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", color: "white", padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "38px", fontWeight: "900", marginBottom: "16px" }}>Kho Học Liệu Số Phan Thị Phương</h2>
        <p style={{ fontSize: "16px", opacity: 0.9, marginBottom: "30px" }}>Hệ thống lưu trữ bài giảng và giáo án trực tuyến</p>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm bài giảng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: "550px", padding: "16px 24px", borderRadius: "50px", border: "none", fontSize: "16px", outline: "none" }}
        />
      </div>

      {/* DANH SÁCH BÀI GIẢNG */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
          {filtered.map((doc) => (
            <div key={doc.id} style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "180px", backgroundImage: `url(${doc.image_url || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800'})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 10px 0" }}>{doc.title}</h3>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px 0", flex: 1 }}>{doc.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                  <span style={{ fontSize: "13px", color: "#475569", fontWeight: "600", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {doc.file_name}</span>
                  <button onClick={() => handleDownload(doc.file_url, doc.file_name)} style={{ background: "#2563eb", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>⬇️ Tải Xuống</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}