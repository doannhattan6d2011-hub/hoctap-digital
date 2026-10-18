"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ============================================================================
// 1. STYLESHEET CHI TIẾT CHO TRANG UPLOAD (ADMIN)
// ============================================================================
const UploadStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #f1f5f9; color: #0f172a; margin: 0; padding: 0; }

    .upload-layout {
      min-height: 100vh;
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .upload-container {
      width: 100%;
      max-width: 800px;
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      padding: 40px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
    }

    .upload-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #f1f5f9;
    }

    .upload-title {
      font-size: 26px;
      font-weight: 900;
      color: #1e3a8a;
      margin: 0 0 4px 0;
    }

    .upload-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .btn-back {
      background: #f1f5f9;
      color: #334155;
      padding: 10px 18px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      transition: all 0.2s;
      border: 1px solid #e2e8f0;
    }
    .btn-back:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .form-input, .form-textarea {
      width: 100%;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      font-size: 15px;
      color: #0f172a;
      background: #f8fafc;
      transition: all 0.2s ease;
      outline: none;
    }
    .form-input:focus, .form-textarea:focus {
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 120px;
    }

    .file-drop-area {
      border: 2px dashed #94a3b8;
      border-radius: 16px;
      padding: 40px 20px;
      text-align: center;
      background: #f8fafc;
      transition: all 0.2s ease;
      cursor: pointer;
      position: relative;
    }
    .file-drop-area:hover, .file-drop-area.active {
      border-color: #2563eb;
      background: #eff6ff;
    }

    .file-input-hidden {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .file-icon {
      font-size: 40px;
      margin-bottom: 12px;
      display: block;
    }

    .file-name-display {
      margin-top: 12px;
      padding: 12px;
      background: #e0f2fe;
      color: #0369a1;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      display: inline-block;
      border: 1px solid #bae6fd;
    }

    .btn-submit {
      width: 100%;
      padding: 18px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 16px;
    }
    .btn-submit:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
    }
    .btn-submit:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }

    .alert {
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 24px;
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .alert-error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .alert-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  `}} />
);

// ============================================================================
// 2. MAIN COMPONENT: UPLOAD PAGE
// ============================================================================
export default function AdminUploadPage() {
  const router = useRouter();
  
  // States quản lý Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  // States quản lý trạng thái tải lên
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [progressText, setProgressText] = useState("");

  // Kiểm tra quyền Admin
  useEffect(() => {
    const stored = localStorage.getItem("phanthiphuong_user");
    if (!stored) {
      router.push("/auth/login");
      return;
    }
    try {
      const user = JSON.parse(stored);
      if (user.role !== "admin" && !user.email.includes("admin")) {
        alert("⚠️ Bạn không có quyền Đăng tải tài liệu!");
        router.push("/");
      }
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  // Xử lý khi chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Giới hạn file < 50MB (Tùy chỉnh nếu cần)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setErrorMsg("Kích thước file quá lớn (Vượt quá 50MB). Vui lòng chọn file nhỏ hơn.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setErrorMsg("");
    }
  };

  // Xử lý Gửi Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!title || !description || !file) {
      setErrorMsg("Vui lòng điền đủ Tên bài giảng, Mô tả và Chọn File đính kèm.");
      return;
    }

    setLoading(true);

    try {
      // 1. TẢI FILE LÊN SUPABASE STORAGE
      setProgressText("Đang tải file lên kho lưu trữ đám mây...");
      
      const fileExt = file.name.split('.').pop();
      const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('panthiphuong_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Lỗi Storage: ${uploadError.message}. Vui lòng kiểm tra lại SQL Permissions.`);
      }

      // 2. LẤY LINK TẢI XUỐNG PUBLIC URL
      setProgressText("Đang tạo liên kết tải xuống an toàn...");
      const { data: publicUrlData } = supabase.storage
        .from('panthiphuong_files')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. LƯU THÔNG TIN VÀO CƠ SỞ DỮ LIỆU
      setProgressText("Đang lưu thông tin vào cơ sở dữ liệu...");
      const { error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
            file_name: file.name,
            file_url: publicUrl
          }
        ]);

      if (dbError) {
        throw new Error(`Lỗi Database: ${dbError.message}`);
      }

      // THÀNH CÔNG
      setSuccessMsg("🎉 Đăng tải bài giảng thành công! Đang quay lại Bảng quản trị...");
      
      // Chuyển hướng sau 1.5 giây
      setTimeout(() => {
        router.push("/admin");
      }, 1500);

    } catch (err: any) {
      console.error("Upload Error:", err);
      setErrorMsg(err.message || "Đã xảy ra lỗi không xác định trong quá trình tải lên.");
    } finally {
      if (!successMsg) {
        setLoading(false);
        setProgressText("");
      }
    }
  };

  return (
    <>
      <UploadStyles />
      
      <div className="upload-layout">
        <div className="upload-container">
          
          <div className="upload-header">
            <div>
              <h1 className="upload-title">➕ Đăng Tải Học Liệu Mới</h1>
              <p className="upload-subtitle">Thêm bài giảng, giáo án hoặc tài liệu vào hệ thống</p>
            </div>
            <Link href="/admin" className="btn-back">
              🔙 Quay Lại
            </Link>
          </div>

          {errorMsg && (
            <div className="alert alert-error">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success">
              <span>✅</span> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tên Bài Giảng / Chủ Đề *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ví dụ: Giáo án điện tử Ngữ Văn 6..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mô Tả Nội Dung *</label>
              <textarea 
                className="form-textarea" 
                placeholder="Tóm tắt nội dung chính của tài liệu này..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Đường Dẫn Ảnh Bìa (Tùy chọn)</label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="Dán link ảnh (https://...) để làm ảnh bìa. Bỏ trống sẽ dùng ảnh mặc định." 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tệp Đính Kèm (PPTX, PDF, DOCX...) *</label>
              <div className="file-drop-area">
                <input 
                  type="file" 
                  className="file-input-hidden" 
                  onChange={handleFileChange}
                  disabled={loading}
                  required={!file}
                />
                
                {!file ? (
                  <>
                    <span className="file-icon">📁</span>
                    <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px", marginBottom: "4px" }}>
                      Kéo thả hoặc Nhấp để chọn File
                    </div>
                    <div style={{ color: "#64748b", fontSize: "13px" }}>
                      Hỗ trợ mọi định dạng tài liệu học tập
                    </div>
                  </>
                ) : (
                  <>
                    <span className="file-icon">📄</span>
                    <div className="file-name-display">
                      {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                    <div style={{ marginTop: "12px", fontSize: "13px", color: "#64748b" }}>
                      Nhấp vào đây nếu muốn chọn file khác
                    </div>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>⏳ {progressText || "ĐANG XỬ LÝ DỮ LIỆU..."}</>
              ) : (
                <>🚀 ĐĂNG TẢI TÀI LIỆU LÊN HỆ THỐNG</>
              )}
            </button>
          </form>

        </div>
      </div>
    </>
  );
}