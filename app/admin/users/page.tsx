"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ============================================================================
// 1. CẤU TRÚC KIỂU DỮ LIỆU THÀNH VIÊN (TYPESCRIPT)
// ============================================================================
export interface UserProfileItem {
  id: string;
  email: string;
  username: string;
  password?: string;
  role: string;
  created_at?: string;
}

// ============================================================================
// 2. STYLESHEET CHI TIẾT GIAO DIỆN QUẢN LÝ USER
// ============================================================================
const AdminUsersStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #f1f5f9; color: #0f172a; margin: 0; padding: 0; }

    .users-wrapper {
      max-width: 1320px;
      margin: 0 auto;
      padding: 40px 24px;
    }

    .users-card {
      background: #ffffff;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      padding: 36px;
      box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05);
    }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 16px;
    }

    .users-title {
      font-size: 28px;
      font-weight: 900;
      color: #1e3a8a;
      margin: 0 0 6px 0;
    }

    .users-subtitle {
      color: #64748b;
      font-size: 14px;
      margin: 0;
    }

    .btn-action-top {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 800;
      font-size: 14px;
      transition: all 0.2s;
    }
    .btn-action-top:hover {
      background: #1e293b;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .metric-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .table-viewport {
      width: 100%;
      overflow-x: auto;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
    }

    .users-table th {
      background: #f8fafc;
      color: #475569;
      padding: 18px 16px;
      font-weight: 800;
      border-bottom: 2px solid #e2e8f0;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    .users-table td {
      padding: 18px 16px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }

    .users-table tr:hover {
      background-color: #f8fafc;
    }

    .badge-role {
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 800;
      display: inline-block;
    }
    .badge-admin { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-user { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }

    .pass-field {
      font-family: monospace;
      font-weight: 700;
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-eye {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      padding: 2px 4px;
    }

    .btn-edit {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      margin-right: 8px;
    }
    .btn-edit:hover { background: #2563eb; color: white; }

    .btn-del {
      background: #fef2f2;
      color: #ef4444;
      border: 1px solid #fecaca;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-del:hover { background: #ef4444; color: white; }

    /* Modal Edit User */
    .edit-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .edit-modal-card {
      background: white;
      width: 100%;
      max-width: 500px;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .modal-input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      margin-top: 6px;
      margin-bottom: 20px;
      font-size: 15px;
      outline: none;
    }
    .modal-input:focus { border-color: #2563eb; }
  `}} />
);

// ============================================================================
// 3. MAIN COMPONENT: XỬ LÝ QUẢN LÝ NGƯỜI DÙNG & MẬT KHẨU
// ============================================================================
export default function AdminUsersManagementPage() {
  const router = useRouter();

  const [usersList, setUsersList] = useState<UserProfileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  
  // Trạng thái hiển thị mật khẩu
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});

  // Trạng thái Modal chỉnh sửa
  const [editingUser, setEditingUser] = useState<UserProfileItem | null>(null);
  const [newUsername, setNewUsername] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("user");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    // Kiểm tra quyền Admin
    const stored = localStorage.getItem("phanthiphuong_user");
    if (!stored) {
      router.push("/auth/login");
      return;
    }
    try {
      const user = JSON.parse(stored);
      if (user.role !== "admin") {
        alert("⚠️ Bạn không có quyền truy cập vào danh sách Thành viên!");
        router.push("/");
        return;
      }
    } catch {
      router.push("/auth/login");
      return;
    }

    fetchUsersFromDatabase();
  }, [router]);

  const fetchUsersFromDatabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setUsersList(data);
    } catch (err: any) {
      alert("❌ Không thể lấy danh sách người dùng: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mở/tắt ẩn hiện mật khẩu của một user
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Mở modal chỉnh sửa user
  const handleOpenEditModal = (user: UserProfileItem) => {
    setEditingUser(user);
    setNewUsername(user.username || "");
    setNewPassword(user.password || "");
    setNewRole(user.role || "user");
  };

  // Lưu thông tin/mật khẩu mới do Admin sửa
  const handleSaveUserChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!newUsername.trim() || !newPassword.trim()) {
      alert("Vui lòng nhập đủ Họ tên và Mật khẩu!");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: newUsername.trim(),
          password: newPassword.trim(),
          role: newRole,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      alert("✅ Đã cập nhật thành công thông tin người dùng!");
      
      // Cập nhật lại UI lập tức
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, username: newUsername.trim(), password: newPassword.trim(), role: newRole }
            : u
        )
      );

      setEditingUser(null);
    } catch (err: any) {
      alert("❌ Cập nhật thất bại: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Xóa tài khoản thành viên
  const handleDeleteUser = async (userId: string, email: string) => {
    if (email.includes("admin@phanthiphuong.com")) {
      alert("⛔ Không thể xóa tài khoản Admin gốc!");
      return;
    }

    if (!confirm(`⚠️ Chị có chắc chắn muốn xóa vĩnh viễn tài khoản: ${email}?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) throw error;

      alert("✅ Đã xóa tài khoản khỏi hệ thống!");
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert("❌ Không thể xóa tài khoản: " + err.message);
    }
  };

  // Lọc tìm kiếm người dùng
  const filteredUsers = usersList.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = usersList.filter((u) => u.role === "admin").length;
  const userCount = usersList.length - adminCount;

  return (
    <>
      <AdminUsersStyles />

      <div className="users-wrapper">
        <div className="users-card">
          
          {/* HEADER */}
          <div className="users-header">
            <div>
              <h1 className="users-title">👥 Quản Lý Người Dùng & Mật Khẩu</h1>
              <p className="users-subtitle">Xem, cấp lại mật khẩu và phân quyền thành viên hệ thống</p>
            </div>
            <Link href="/admin" className="btn-action-top">
              🔙 Quay Lại Bảng Quản Trị
            </Link>
          </div>

          {/* CHỈ SỐ THỐNG KÊ */}
          <div className="metrics-grid">
            <div className="metric-box">
              <div className="metric-icon" style={{ background: "#dbeafe", color: "#2563eb" }}>👥</div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "900" }}>{usersList.length}</div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Tổng Thành Viên</div>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon" style={{ background: "#fef3c7", color: "#b45309" }}>🛡️</div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "900" }}>{adminCount}</div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Quản Trị Viên</div>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon" style={{ background: "#e0f2fe", color: "#0369a1" }}>👤</div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "900" }}>{userCount}</div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Học Sinh / Giáo Viên</div>
              </div>
            </div>
          </div>

          {/* THANH TÌM KIẾM */}
          <div style={{ marginBottom: "24px" }}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm thành viên theo Tên hoặc Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "16px 20px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px" }}
            />
          </div>

          {/* BẢNG DANH SÁCH THÀNH VIÊN */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#2563eb", fontWeight: "800" }}>
              ⏳ Đang tải dữ liệu thành viên từ máy chủ...
            </div>
          ) : (
            <div className="table-viewport">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Họ và Tên</th>
                    <th>Email Tài Khoản</th>
                    <th>Mật Khẩu Hiển Thị</th>
                    <th>Quyền Hạn</th>
                    <th style={{ textAlign: "right" }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                        Không tìm thấy thành viên nào.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: "800" }}>{u.username}</td>
                        <td style={{ color: "#64748b" }}>{u.email}</td>
                        <td>
                          <div className="pass-field">
                            <span>{visiblePasswords[u.id] ? u.password || "••••••" : "••••••••"}</span>
                            <button className="btn-eye" onClick={() => togglePasswordVisibility(u.id)}>
                              {visiblePasswords[u.id] ? "🙈" : "👁️"}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-role ${u.role === "admin" ? "badge-admin" : "badge-user"}`}>
                            {u.role ? u.role.toUpperCase() : "USER"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button onClick={() => handleOpenEditModal(u)} className="btn-edit">
                            ✏️ Đổi Mật Khẩu / Sửa
                          </button>
                          <button onClick={() => handleDeleteUser(u.id, u.email)} className="btn-del">
                            🗑️ Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* MODAL CẤP LAI MẬT KHẨU CHO USER */}
      {editingUser && (
        <div className="edit-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingUser(null); }}>
          <div className="edit-modal-card">
            <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#1e3a8a", margin: "0 0 8px 0" }}>
              ✏️ Sửa Thông Tin Thành Viên
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
              Tài khoản: <strong>{editingUser.email}</strong>
            </p>

            <form onSubmit={handleSaveUserChanges}>
              <label style={{ fontWeight: "800", fontSize: "13px", color: "#334155" }}>Họ và Tên</label>
              <input
                type="text"
                className="modal-input"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />

              <label style={{ fontWeight: "800", fontSize: "13px", color: "#334155" }}>Mật Khẩu Mới (Mật khẩu hiện tại: {editingUser.password})</label>
              <input
                type="text"
                className="modal-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <label style={{ fontWeight: "800", fontSize: "13px", color: "#334155" }}>Quyền Hạn Hạn Định</label>
              <select
                className="modal-input"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">User (Thành viên / Học sinh)</option>
                <option value="admin">Admin (Quản trị viên)</option>
              </select>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontWeight: "800", cursor: "pointer" }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "none", background: "#2563eb", color: "white", fontWeight: "800", cursor: "pointer" }}
                >
                  {saving ? "⏳ Đang Lưu..." : "💾 Cập Nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}