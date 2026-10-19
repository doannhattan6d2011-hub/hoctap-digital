"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ============================================================================
// 1. DANH SÁCH PHÂN LOẠI CỐ ĐỊNH (LỚP & MÔN)
// ============================================================================
const GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Khối THPT", "Tài Liệu Chung"];
const CATEGORIES = [
  "Ngữ Văn", 
  "GDĐP (Giáo Dục Địa Phương)", 
  "Mỹ Thuật", 
  "Bài Giảng Thi Giáo Viên Giỏi", 
  "Tài Liệu Học Sinh Chuẩn Bị", 
  "Đề Thi & Kiểm Tra",
  "Khác"
];

// ============================================================================
// 2. STYLESHEET SIÊU ĐẸP CHO KHU VỰC UPLOAD
// ============================================================================
const AdminUploadStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #f1f5f9; color: #0f172a; margin: 0; padding: 0; }

    .upload-wrapper { min-height: 100vh; padding: 60px 24px; display: flex; justify-content: center; }
    .upload-card { width: 100%; max-width: 900px; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 48px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); }

    .upload-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #f1f5f9; }
    .upload-title { font-size: 28px; font-weight: 900; color: #1e3a8a; margin: 0 0 8px 0; }
    .upload-subtitle { font-size: 15px; color: #64748b; margin: 0; }
    .btn-cancel { background: #f8fafc; color: #475569; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 800; border: 1px solid #cbd5e1; transition: 0.2s; }
    .btn-cancel:hover { background: #e2e8f0; color: #0f172a; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .form-group { margin-bottom: 24px; }
    .form-group.full-width { grid-column: 1 / -1; }

    .form-label { display: block; font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 10px; }
    
    .form-input, .form-select, .form-textarea {
      width: 100%; padding: 16px 20px; border-radius: 12px; border: 1px solid #cbd5e1;
      font-size: 15px; color: #0f172a; background: #f8fafc; transition: all 0.2s; outline: none;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #2563eb; background: #ffffff; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
    .form-textarea { min-height: 120px; resize: vertical; }

    .dropzone {
      border: 2px dashed #94a3b8; border-radius: 16px; padding: 48px 24px; text-align: center;
      background: #f8fafc; cursor: pointer; transition: 0.3s; position: relative;
    }
    .dropzone:hover { border-color: #2563eb; background: #eff6ff; }
    .drop-input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
    .drop-icon { font-size: 48px; margin-bottom: 16px; display: block; }
    .drop-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    .drop-desc { font-size: 14px; color: #64748b; }
    
    .file-selected { background: #e0f2fe; border: 2px solid #38bdf8; border-radius: 16px; padding: 32px; text-align: center; position: relative; }
    .file-name { font-size: 18px; font-weight: 800; color: #0369a1; margin-bottom: 8px; word-break: break-all; }
    .file-size { font-size: 14px; color: #0284c7; font-weight: 600; }
    
    .btn-submit {
      width: 100%; padding: 20px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white;
      border: none; border-radius: 16px; font-size: 18px; font-weight: 900; cursor: pointer;
      margin-top: 32px; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 12px;
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 25px -5px rgba(37,99,235,0.4); }
    .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

    .status-alert { padding: 16px 20px; border-radius: 12px; font-weight: 700; font-size: 15px; margin-bottom: 24px; }
    .status-error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .status-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  `}} />
);

// ============================================================================
// 3. MAIN COMPONENT: XỬ LÝ UPLOAD VÀ LƯU DATABASE
// ============================================================================
export default function UploadDocumentPage() {
  const router = useRouter();
  
  // Dữ liệu Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState(GRADES[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Trạng thái hệ thống
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Xác thực Admin
  useEffect(() => {
    const userStr = localStorage.getItem("phanthiphuong_user");
    if (!userStr) { router.push("/auth/login"); return; }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      alert("Chỉ Admin mới có quyền tải lên!");
      router.push("/");
    }
  }, [router]);

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 100 * 1024 * 1024) {
        setError("File quá lớn. Vui lòng chọn file dưới 100MB.");
        setFile(null);
      } else {
        setFile(selected);
        setError("");
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!title || !description || !file) {
      setError("Vui lòng điền đủ Tên, Mô tả và chọn File đính kèm.");
      return;
    }

    setLoading(true);

    try {
      // 1. Đẩy file lên Supabase Storage
      const fileExt = file.name.split('.').pop();
      const safeName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('panthiphuong_files')
        .upload(`documents/${safeName}`, file);

      if (uploadError) throw new Error("Lỗi Upload Storage: " + uploadError.message);

      // 2. Lấy link tải bảo mật
      const { data: { publicUrl } } = supabase.storage
        .from('panthiphuong_files')
        .getPublicUrl(`documents/${safeName}`);

      // 3. Lưu toàn bộ thông tin (Kèm Lớp, Môn) vào Database
      const { error: dbError } = await supabase
        .from('documents')
        .insert([{
          title: title.trim(),
          description: description.trim(),
          grade: grade,
          category: category,
          image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
          file_name: file.name,
          file_url: publicUrl,
          download_count: 0
        }]);

      if (dbError) throw new Error("Lỗi lưu Database: " + dbError.message);

      setSuccess("🎉 Tải tài liệu lên thành công! Đang chuyển về bảng Quản trị...");
      setTimeout(() => router.push("/admin"), 1500);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <AdminUploadStyles />
      <div className="upload-wrapper">
        <div className="upload-card">
          
          <div className="upload-header">
            <div>
              <h1 className="upload-title">Đăng Tải Tài Liệu</h1>
              <p className="upload-subtitle">Phân loại theo Lớp và Danh mục chi tiết</p>
            </div>
            <Link href="/admin" className="btn-cancel">✕ Hủy & Quay Lại</Link>
          </div>

          {error && <div className="status-alert status-error">⚠️ {error}</div>}
          {success && <div className="status-alert status-success">✅ {success}</div>}

          <form onSubmit={handleUploadSubmit}>
            <div className="form-group full-width">
              <label className="form-label">Tên Bài Giảng / Chủ Đề *</label>
              <input type="text" className="form-input" placeholder="VD: Giáo án Ngữ Văn 6 - Bài 1..." value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading}/>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Cấp Lớp Học *</label>
                <select className="form-select" value={grade} onChange={(e) => setGrade(e.target.value)} disabled={loading}>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Danh Mục Môn / Thể Loại *</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Mô Tả Nội Dung *</label>
              <textarea className="form-textarea" placeholder="Nội dung chính của tài liệu này là gì?" value={description} onChange={(e) => setDescription(e.target.value)} required disabled={loading}/>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Đường dẫn Ảnh Bìa (Tùy chọn)</label>
              <input type="url" className="form-input" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={loading}/>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Tệp Tài Liệu Đính Kèm *</label>
              {!file ? (
                <div className="dropzone">
                  <input type="file" className="drop-input" onChange={handleFileDrop} required disabled={loading}/>
                  <span className="drop-icon">📤</span>
                  <div className="drop-title">Kéo thả hoặc Nhấp để chọn File</div>
                  <div className="drop-desc">Hỗ trợ PDF, DOCX, PPTX (Tối đa 100MB)</div>
                </div>
              ) : (
                <div className="file-selected">
                  <input type="file" className="drop-input" onChange={handleFileDrop} disabled={loading}/>
                  <div className="file-name">📄 {file.name}</div>
                  <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB - Nhấp để thay đổi file</div>
                </div>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "⏳ ĐANG XỬ LÝ LÊN ĐÁM MÂY..." : "🚀 LƯU VÀ XUẤT BẢN TÀI LIỆU"}
            </button>
          </form>

        </div>
      </div>
    </>
  );
}