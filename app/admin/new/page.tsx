"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!file || !title.trim()) {
      setError("Hãy nhập tên tài liệu và chọn file PowerPoint.");
      return;
    }

    setLoading(true);

    try {
      const type = file.type || "application/octet-stream";

      const presignResponse = await fetch("/api/admin/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          type,
        }),
      });

      const presign = await presignResponse.json();
      if (!presignResponse.ok) {
        throw new Error(presign.message || "Không tạo được URL upload.");
      }

      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload file lên Supabase Storage thất bại.");
      }

      const saveResponse = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          originalName: file.name,
          key: presign.key,
          mimeType: type,
          sizeBytes: file.size,
          subject: "Chưa phân loại",
          grade: "Chưa phân loại",
        }),
      });

      const saved = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(saved.message || "File đã upload nhưng chưa lưu được thông tin.");
      }

      alert("Đã upload file và lưu tài liệu vào database.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi khi upload.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 32, background: "white", borderRadius: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Đăng tải học liệu</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
        <label style={{ display: "grid", gap: 8 }}>
          Tên bài giảng *
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 12, border: "1px solid #cbd5e1", borderRadius: 8 }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Mô tả
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: 12, border: "1px solid #cbd5e1", borderRadius: 8 }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          File PowerPoint (.ppt hoặc .pptx) *
          <input
            required
            type="file"
            accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {file && <p>File đã chọn: {file.name}</p>}
        {error && <p role="alert" style={{ color: "#dc2626" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 16,
            color: "white",
            background: loading ? "#64748b" : "#2563eb",
            border: 0,
            borderRadius: 8,
            fontWeight: 800,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Đang upload và lưu..." : "Upload tài liệu"}
        </button>
      </form>
    </main>
  );
}
