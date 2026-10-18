"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function AdminUploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("pan_user") || "{}");
    if (user.role !== 'admin') router.push('/');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !description) return alert("Vui lòng nhập đủ thông tin!");
    setLoading(true);

    try {
      // 1. Upload File lên Storage Supabase
      const fileExt = file.name.split('.').pop();
      const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('panthiphuong_files')
        .upload(`documents/${safeFileName}`, file);

      if (uploadError) throw uploadError;

      // Lấy link tải bảo mật
      const { data: { publicUrl } } = supabase.storage.from('panthiphuong_files').getPublicUrl(`documents/${safeFileName}`);

      // 2. Lưu thông tin vào Database
      const { error: dbError } = await supabase.from('documents').insert([
        {
          title,
          description,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
          file_name: file.name,
          file_url: publicUrl
        }
      ]);

      if (dbError) throw dbError;

      alert("✅ Đăng tải học liệu thành công lên đám mây!");
      router.push("/admin");
    } catch (error: any) {
      alert("❌ Có lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px" }}>
          <h2 style={{ fontSize: "28px", color: "#0f172a", fontWeight: "900" }}>➕ Tải Học Liệu Mới</h2>
          <Link href="/admin" style={{ background: "#64748b", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>Quay Lại</Link>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#1e293b" }}>Tên Bài Giảng *</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#1e293b" }}>Mô Tả *</label>
            <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#1e293b" }}>Link Ảnh Bìa (Tùy chọn)</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }} />
          </div>
          <div style={{ background: "#f8fafc", padding: "20px", border: "2px dashed #94a3b8", borderRadius: "12px", textAlign: "center" }}>
            <label style={{ display: "block", marginBottom: "12px", fontWeight: "bold", color: "#1e293b" }}>Chọn File (PPTX, PDF, DOCX) *</label>
            <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} style={{ margin: "0 auto" }} />
          </div>
          <button type="submit" disabled={loading} style={{ background: "#2563eb", color: "white", padding: "18px", borderRadius: "8px", fontWeight: "900", fontSize: "18px", border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "⏳ ĐANG ĐẨY DỮ LIỆU LÊN ĐÁM MÂY..." : "🚀 TẢI LÊN HỆ THỐNG"}
          </button>
        </form>
      </div>
    </div>
  );
}