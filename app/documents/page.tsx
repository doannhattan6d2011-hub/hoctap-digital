"use client";
import React, { useEffect, useState } from "react";

export default function HomePage() {
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    // Đọc chính xác nguồn dữ liệu mà Admin đã tải lên
    const stored = localStorage.getItem("mock_documents");
    if (stored) {
      setFiles(JSON.parse(stored));
    }
  }, []);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "36px", color: "#0f172a", fontWeight: "900" }}>📚 KHO HỌC LIỆU SỐ</h1>
        <p style={{ color: "#64748b", fontSize: "18px" }}>Danh sách các bài giảng và tài liệu được chia sẻ mới nhất.</p>
      </div>

      {files.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: "12px", color: "#64748b", backgroundColor: "#f8fafc" }}>
          Chưa có bài giảng nào trong hệ thống.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {files.map((file: any) => (
            <div key={file.id} style={{ border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", backgroundColor: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              {/* Ảnh Demo */}
              <div style={{ width: "100%", height: "200px", backgroundColor: "#e2e8f0", backgroundImage: `url(${file.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
              
              <div style={{ padding: "20px" }}>
                <h3 style={{ fontSize: "18px", color: "#0f172a", margin: "0 0 10px 0", lineHeight: "1.4" }}>📄 {file.title}</h3>
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 20px 0", lineHeight: "1.6", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {file.description}
                </p>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                  <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>📅 {file.date}</span>
                  <button onClick={() => alert("File tải xuống đã sẵn sàng!")} style={{ padding: "10px 20px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>
                    ⬇️ Tải Về
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}