"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "../../../lib/db";

export default function AdminUploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !fileName) {
      alert("⚠️ Vui lòng điền đầy đủ Tên, Mô tả và Chọn tệp đính kèm!");
      return;
    }
    setLoading(true);
    
    // Ghi trực tiếp vào Database
    Database.addDocument({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
      fileName: fileName
    });

    setTimeout(() => {
      alert("✅ Đăng tải học liệu thành công rực rỡ!");
      router.push("/admin"); // Đẩy về trang quản lý để thấy file xuất hiện ngay lập tức
    }, 600);
  };

  return (
    <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "28px", color: "#0f172a", margin: "0 0 30px 0", fontWeight: "900", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px" }}>
        ➕ Đăng Tải Học Liệu Mới
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Nhập Tên Bài */}
        <div>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>1. Tên Bài Giảng / Học Liệu <span style={{color: "red"}}>*</span></label>
          <input type="text" placeholder="VD: Giáo án Ngữ Văn 6 - Cây Khế..." value={title} onChange={e => setTitle(e.target.value)} required style={{ width: "100%", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", boxSizing: "border-box", outlineColor: "#2563eb" }} />
        </div>

        {/* Nhập Mô tả */}
        <div>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>2. Mô Tả Chi Tiết <span style={{color: "red"}}>*</span></label>
          <textarea placeholder="Nhập tóm tắt nội dung bài học để học sinh dễ hình dung..." value={description} onChange={e => setDescription(e.target.value)} required rows={4} style={{ width: "100%", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", boxSizing: "border-box", fontFamily: "inherit", outlineColor: "#2563eb" }} />
        </div>

        {/* Nhập Link Ảnh */}
        <div>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>3. Link Ảnh Bìa (Tùy chọn - Giúp bài học đẹp hơn)</label>
          <input type="url" placeholder="Dán đường link hình ảnh (đuôi .jpg, .png) vào đây..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ width: "100%", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", boxSizing: "border-box", outlineColor: "#2563eb" }} />
        </div>

        {/* Chọn Tệp */}
        <div style={{ padding: "20px", backgroundColor: "#f8fafc", border: "2px dashed #94a3b8", borderRadius: "12px", textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "16px", fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>4. Tải Tệp Đính Kèm (PowerPoint, Word, PDF) <span style={{color: "red"}}>*</span></label>
          <input 
            type="file" 
            required 
            onChange={e => setFileName(e.target.files?.[0]?.name || "")}
            style={{ display: "block", margin: "0 auto", cursor: "pointer", fontSize: "15px" }} 
          />
          {fileName && <div style={{ marginTop: "16px", color: "#10b981", fontWeight: "bold" }}>✅ Đã chọn tệp: {fileName}</div>}
        </div>

        {/* Nút Submit */}
        <button type="submit" disabled={loading} style={{ padding: "18px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: "900", cursor: "pointer", fontSize: "18px", marginTop: "10px", transition: "0.3s", opacity: loading ? 0.7 : 1 }}>
          {loading ? "⏳ HỆ THỐNG ĐANG LƯU DỮ LIỆU..." : "🚀 ĐĂNG TẢI LÊN HỆ THỐNG"}
        </button>

      </form>
    </div>
  );
}