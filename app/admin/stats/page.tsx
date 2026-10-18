"use client";

import React from "react";
import Link from "next/link";

export default function AdminStatsPage() {
  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", background: "white", padding: "40px", borderRadius: "16px", textAlign: "center", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "24px", color: "#1e40af", fontWeight: "900", marginBottom: "16px" }}>📊 Thống Kê Hệ Thống</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Dữ liệu hệ thống được đồng bộ trực tiếp trên cơ sở dữ liệu Supabase.</p>
        <Link href="/admin" style={{ background: "#2563eb", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>Quay Lại Bảng Quản Trị</Link>
      </div>
    </div>
  );
}