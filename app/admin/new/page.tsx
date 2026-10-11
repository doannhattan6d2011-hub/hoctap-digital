"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SUBJECT_OPTIONS = [
  "Ngữ Văn",
  "Toán Học",
  "Tiếng Anh",
  "Vật Lý",
  "Hóa Học",
  "Sinh Học",
  "Lịch Sử",
  "Địa Lý",
  "Tin Học",
  "Giáo Dục Công Dân",
];

const GRADE_OPTIONS = [
  "Lớp 6",
  "Lớp 7",
  "Lớp 8",
  "Lớp 9",
  "Lớp 10",
  "Lớp 11",
  "Lớp 12",
  "Khối Đại Học",
];

interface FormState {
  title: string;
  subject: string;
  grade: string;
  topic: string;
  description: string;
  author: string;
  isPublic: boolean;
  allowDownload: boolean;
  tags: string[];
}

export default function AdminNewDocumentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<FormState>({
    title: "",
    subject: "Ngữ Văn",
    grade: "Lớp 9",
    topic: "",
    description: "",
    author: "Ban Quản Trị",
    isPublic: true,
    allowDownload: true,
    tags: ["PowerPoint", "Bài giảng số"],
  });

  const [tagInput, setTagInput] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validExtensions = [".ppt", ".pptx"];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setErrorMessage("Chỉ chấp nhận định dạng file PowerPoint (.ppt hoặc .pptx)!");
      setFile(null);
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setErrorMessage("Dung lượng file vượt quá giới hạn 100MB!");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setErrorMessage("");
    if (!formData.title) {
      const defaultTitle = selectedFile.name.replace(/\.[^/.]+$/, "");
      setFormData((prev) => ({ ...prev, title: defaultTitle }));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // GỬI ĐÚNG FORMDATA ĐÍNH KÈM TỆP THỰC TẾ SANG SERVER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.title || formData.title.trim().length < 2) {
      setErrorMessage("Tên tài liệu bắt buộc phải có ít nhất 2 ký tự!");
      return;
    }

    if (!file) {
      setErrorMessage("Vui lòng đính kèm tệp bài giảng PowerPoint (.pptx)!");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(30);

      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("subject", formData.subject);
      data.append("grade", formData.grade);
      data.append("topic", formData.topic.trim());
      data.append("description", formData.description.trim());
      data.append("file", file);

      setUploadProgress(70);

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: data,
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detailMsg = result.message || result.error || "Không thể đồng bộ dữ liệu.";
        throw new Error(`Server từ chối (HTTP ${res.status}): ${detailMsg}`);
      }

      setUploadProgress(100);
      setSuccessMessage("🎉 Tải lên và đính kèm tệp bài giảng thành công!");
      setShowSuccessModal(true);

    } catch (err: any) {
      console.error("Upload process error:", err);
      setErrorMessage(err.message || "Xảy ra lỗi trong quá trình tải lên.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      title: "",
      subject: "Ngữ Văn",
      grade: "Lớp 9",
      topic: "",
      description: "",
      author: "Ban Quản Trị",
      isPublic: true,
      allowDownload: true,
      tags: ["PowerPoint", "Bài giảng số"],
    });
    setFile(null);
    setUploadProgress(0);
    setErrorMessage("");
    setSuccessMessage("");
    setShowSuccessModal(false);
  };

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#1e293b", margin: 0, paddingBottom: "60px" }}>
      
      {/* HEADER QUẢN TRỊ */}
      <header style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ backgroundColor: "#2563eb", color: "#fff", fontWeight: "bold", padding: "6px 12px", borderRadius: "8px", fontSize: "16px" }}>HT</span>
          <span style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.5px" }}>HocTap Digital Admin</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            ← Xem Trang Chủ
          </Link>
          <span style={{ backgroundColor: "#1e293b", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", color: "#38bdf8", border: "1px solid #334155" }}>
            ● Hệ thống hoạt động
          </span>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div style={{ maxWidth: "1200px", margin: "24px auto 0 auto", padding: "0 24px" }}>
        <div style={{ fontSize: "13px", color: "#64748b", display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Trang chủ</Link>
          <span>/</span>
          <span style={{ color: "#2563eb", fontWeight: "600" }}>Upload Học Liệu Mới</span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "8px 0 0 0" }}>Bảng Upload & Xuất Bản Tài Liệu</h1>
      </div>

      {/* FORM NHẬP LIỆU */}
      <main style={{ maxWidth: "1200px", margin: "24px auto 0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" }}>
        
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          
          {errorMessage && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "16px", borderRadius: "12px", marginBottom: "24px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>⚠️</span>
              <div style={{ flex: 1, wordBreak: "break-word" }}>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "16px", borderRadius: "12px", marginBottom: "24px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>🎉</span>
              <div>{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* THÀNH PHẦN 1: KHU VỰC KÉO THẢ FILE */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                1. Tệp Bài Giảng PowerPoint (*):
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: dragActive ? "2px dashed #2563eb" : file ? "2px solid #22c55e" : "2px dashed #cbd5e1",
                  backgroundColor: dragActive ? "#eff6ff" : file ? "#f0fdf4" : "#f8fafc",
                  borderRadius: "12px",
                  padding: "32px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ppt,.pptx"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                {file ? (
                  <div>
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>📊</div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#16a34a" }}>{file.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                      Kích thước: {(file.size / (1024 * 1024)).toFixed(2)} MB | Nhấn để chọn file khác
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>📥</div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>
                      Kéo thả file PowerPoint vào đây hoặc <span style={{ color: "#2563eb", textDecoration: "underline" }}>bấm để chọn file</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
                      Hỗ trợ tệp định dạng .ppt, .pptx (Tối đa 100MB)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* THÀNH PHẦN 2: TIÊU ĐỀ */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                2. Tên Tài Liệu / Bài Giảng (*):
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTextChange}
                placeholder="Ví dụ: Bài 5: Cây Khế - Tiết 1 Ngữ Văn 9"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* THÀNH PHẦN 3: MÔN HỌC & LỚP */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                  Môn Học:
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleTextChange}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box" }}
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                  Khối Lớp:
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleTextChange}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box" }}
                >
                  {GRADE_OPTIONS.map((gr) => (
                    <option key={gr} value={gr}>{gr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* THÀNH PHẦN 4: CHỦ ĐỀ */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                Chương / Chủ Đề:
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleTextChange}
                placeholder="Ví dụ: Truyện dân gian Việt Nam"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* THÀNH PHẦN 5: MÔ TẢ */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                Mô Tả Bài Giảng:
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleTextChange}
                rows={4}
                placeholder="Nhập tóm tắt nội dung bài học, mục tiêu cần đạt..."
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

            {/* THÀNH PHẦN 6: TAGS */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                Thẻ Phân Loại (Nhấn Enter để thêm):
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Nhập từ khóa và ấn Enter..."
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                {formData.tags.map((tag) => (
                  <span key={tag} style={{ backgroundColor: "#e2e8f0", color: "#334155", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} style={{ border: "none", background: "none", color: "#94a3b8", cursor: "pointer", padding: 0, fontWeight: "bold" }}>✕</button>
                  </span>
                ))}
              </div>
            </div>

            {/* TIẾN TRÌNH */}
            {loading && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "bold", color: "#2563eb", marginBottom: "6px" }}>
                  <span>⏳ Đang tải file lên Server...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${uploadProgress}%`, height: "100%", backgroundColor: "#2563eb", transition: "width 0.3s ease" }} />
                </div>
              </div>
            )}

            {/* NÚT TẢI LÊN */}
            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
                  padding: "14px",
                  backgroundColor: loading ? "#94a3b8" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
                }}
              >
                {loading ? "⏳ Đang Xử Lý..." : "🚀 Tải Lên & Xuất Bản"}
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Làm Mới
              </button>
            </div>

          </form>
        </div>

        {/* XEM TRƯỚC CARD */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 16px 0" }}>
              👁️ Xem Trước Card Trang Chủ
            </h3>

            <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", fontSize: "11px", fontWeight: "bold", padding: "3px 8px", borderRadius: "4px" }}>
                  {formData.subject}
                </span>
                <span style={{ backgroundColor: "#f1f5f9", color: "#334155", fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "4px" }}>
                  {formData.grade}
                </span>
              </div>

              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0", lineHeight: "1.3" }}>
                {formData.title || "Tên tài liệu..."}
              </h4>

              <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                {formData.description || "Nội dung tóm tắt bài giảng..."}
              </p>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>📅 Hôm nay</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb" }}>⬇️ Tải file</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#eff6ff", borderRadius: "16px", padding: "24px", border: "1px solid #bfdbfe" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1e40af", margin: "0 0 12px 0" }}>
              📌 Quy Định Upload
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#1e3a8a", lineHeight: "1.6" }}>
              <li>Đảm bảo tệp đính kèm thuộc định dạng PowerPoint (.ppt, .pptx).</li>
              <li>Điền đầy đủ tên bài giảng, môn học và khối lớp.</li>
              <li>Tệp sẽ được tự động lưu trữ trên đĩa và hiển thị công khai.</li>
            </ul>
          </div>

        </div>
      </main>

      {/* MODAL THÀNH CÔNG */}
      {showSuccessModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "450px", width: "100%", padding: "32px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>Tải Lên Thành Công!</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px 0" }}>
              Bài giảng <b>{formData.title}</b> đã được lưu thành công vào cơ sở dữ liệu và đính kèm file gốc.
            </p>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => router.push("/")}
                style={{ flex: 1, padding: "12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
              >
                Về Trang Chủ
              </button>
              <button
                onClick={handleResetForm}
                style={{ flex: 1, padding: "12px", backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
              >
                Thêm File Khác
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}