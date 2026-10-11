"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// ============================================================================
// 1. CSS GIAO DIỆN CHUYÊN NGHIỆP (ĐẢM BẢO CHI TIẾT & HÀI HÒA)
// ============================================================================
const AdminStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { box-sizing: border-box; font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
    .admin-container { background-color: #f8fafc; min-height: 100vh; padding: 40px 24px; color: #0f172a; }
    .admin-wrapper { max-width: 1200px; margin: 0 auto; }
    
    .admin-card {
      background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0; overflow: hidden; padding: 32px;
    }

    .header-flex {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;
    }

    .table-container { width: 100%; overflow-x: auto; }
    .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
    .custom-table th {
      background-color: #f8fafc; color: #475569; font-size: 14px; font-weight: 700;
      padding: 16px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .custom-table td {
      padding: 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 14px;
    }
    .custom-table tr:hover { background-color: #f8fafc; }

    .badge-ip {
      background: #f1f5f9; color: #475569; padding: 4px 10px; borderRadius: 6px;
      font-family: monospace; font-size: 12px; font-weight: 600;
    }

    .btn-back {
      display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
      background: #0f172a; color: white; border-radius: 8px; text-decoration: none;
      font-weight: 600; font-size: 14px; transition: background 0.2s;
    }
    .btn-back:hover { background: #1e293b; }

    .empty-state { text-align: center; padding: 60px 20px; color: #64748b; font-style: italic; }
  `}} />
);

// Interface dữ liệu lịch sử tải
interface DownloadRecord {
  id: string;
  createdAt: string;
  userEmail: string;
  documentTitle: string;
  ipAddress: string;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // Đọc lịch sử tải từ localStorage hoặc khởi tạo danh sách mẫu chuyên nghiệp
      const stored = localStorage.getItem("hoctap_download_history");
      if (stored) {
        setDownloads(JSON.parse(stored));
      } else {
        const sampleData: DownloadRecord[] = [
          {
            id: "dl-1",
            createdAt: new Date().toLocaleString("vi-VN"),
            userEmail: "phanthiphuong1976@system.local",
            documentTitle: "Bài Giảng Điện Tử: Sự Tích Cây Khế",
            ipAddress: "127.0.0.1 (Localhost)"
          },
          {
            id: "dl-2",
            createdAt: new Date(Date.now() - 3600000).toLocaleString("vi-VN"),
            userEmail: "giaovien.nguvan@school.edu.vn",
            documentTitle: "Giáo Án: Đất Rừng Phương Nam",
            ipAddress: "192.168.1.50"
          }
        ];
        localStorage.setItem("hoctap_download_history", JSON.stringify(sampleData));
        setDownloads(sampleData);
      }
    } catch (e) {
      console.error("Lỗi khởi tạo lịch sử tải:", e);
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      <AdminStyles />
      <div className="admin-container">
        <div className="admin-wrapper">
          
          {/* Thanh tiêu đề và điều hướng */}
          <div className="header-flex">
            <div>
              <h1 style={{ fontSize: "30px", fontWeight: "900", color: "#0f172a", marginBottom: "6px" }}>📊 Lịch Sử Tải Xuống</h1>
              <p style={{ color: "#64748b", fontSize: "14px" }}>Theo dõi chi tiết các lượt tải tài liệu học tập trên toàn hệ thống.</p>
            </div>
            <Link href="/admin" className="btn-back">
              ← Quay Lại Bảng Điều Khiển
            </Link>
          </div>

          {/* Bảng dữ liệu chi tiết */}
          <div className="admin-card">
            <div className="table-container">
              {downloads.length === 0 ? (
                <div className="empty-state">Chưa ghi nhận lượt tải tài liệu nào trong hệ thống.</div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Thời Gian</th>
                      <th>Người Dùng (Email)</th>
                      <th>Tài Liệu Tải Về</th>
                      <th>Địa Chỉ IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downloads.map((row) => (
                      <tr key={row.id}>
                        <td style={{ fontWeight: "600", color: "#334155" }}>{row.createdAt}</td>
                        <td style={{ color: "#2563eb", fontWeight: "600" }}>{row.userEmail}</td>
                        <td style={{ fontWeight: "700" }}>📄 {row.documentTitle}</td>
                        <td>
                          <span className="badge-ip">{row.ipAddress}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}