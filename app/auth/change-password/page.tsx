"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ============================================================================
// 1. STYLESHEET CHI TIẾT TRANG ĐỔI MẬT KHẨU
// ============================================================================
const ChangePassStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }

    .cp-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    }

    .cp-card {
      background: #ffffff;
      width: 100%;
      max-width: 480px;
      border-radius: 24px;
      padding: 48px 40px;
      box-shadow: 0 20px 30px -10px rgba(37, 99, 235, 0.1);
      border: 1px solid #e2e8f0;
    }

    .cp-title {
      font-size: 26px;
      font-weight: 900;
      color: #1e3a8a;
      margin: 0 0 8px 0;
      text-align: center;
    }

    .cp-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 32px 0;
      text-align: center;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 800;
      color: #334155;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .input-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-input {
      width: 100%;
      padding: 16px 44px 16px 18px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      font-size: 15px;
      outline: none;
      transition: all 0.2s;
    }
    .form-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
    }

    .toggle-eye {
      position: absolute;
      right: 14px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }

    .btn-submit {
      width: 100%;
      padding: 18px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      margin-top: 12px;
      transition: all 0.2s;
    }
    .btn-submit:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-2px);
    }

    .alert {
      padding: 14px 16px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .alert-err { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .alert-ok { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  `}} />
);

// ============================================================================
// 2. MAIN COMPONENT: ĐỔI MẬT KHẨU
// ============================================================================
export default function ChangePasswordPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("phanthiphuong_user");
    if (!stored) {
      alert("Bạn chưa đăng nhập!");
      router.push("/auth/login");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Vui lòng nhập đầy đủ các trường.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu mới và Nhập lại mật khẩu không khớp nhau!");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }

    setLoading(true);

    try {
      // 1. Kiểm tra mật khẩu cũ trên Database
      const { data, error: fetchErr } = await supabase
        .from("profiles")
        .select("password")
        .eq("id", user.id)
        .single();

      if (fetchErr || !data) {
        throw new Error("Không tìm thấy dữ liệu người dùng.");
      }

      if (data.password && data.password !== oldPassword) {
        setErrorMsg("❌ Mật khẩu hiện tại không chính xác!");
        setLoading(false);
        return;
      }

      // 2. Cập nhật mật khẩu mới vào Database
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ password: newPassword })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      // 3. Cập nhật LocalStorage Session
      const updatedUser = { ...user, password: newPassword };
      localStorage.setItem("phanthiphuong_user", JSON.stringify(updatedUser));

      setSuccessMsg("🎉 Đổi mật khẩu thành công! Đang quay lại trang chủ...");
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi không xác định khi cập nhật mật khẩu.");
      setLoading(false);
    }
  };

  return (
    <>
      <ChangePassStyles />
      <div className="cp-wrapper">
        <div className="cp-card">
          <h1 className="cp-title">🔐 Đổi Mật Khẩu Cá Nhân</h1>
          <p className="cp-subtitle">Tài khoản: <strong>{user?.email}</strong></p>

          {errorMsg && <div className="alert alert-err">⚠️ {errorMsg}</div>}
          {successMsg && <div className="alert alert-ok">✅ {successMsg}</div>}

          <form onSubmit={handleChangePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Mật khẩu hiện tại</label>
              <div className="input-box">
                <input
                  type={showOld ? "text" : "password"}
                  className="form-input"
                  placeholder="Nhập mật khẩu cũ..."
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <button type="button" className="toggle-eye" onClick={() => setShowOld(!showOld)}>
                  {showOld ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <div className="input-box">
                <input
                  type={showNew ? "text" : "password"}
                  className="form-input"
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="button" className="toggle-eye" onClick={() => setShowNew(!showNew)}>
                  {showNew ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nhập lại mật khẩu mới</label>
              <input
                type="password"
                className="form-input"
                placeholder="Xác nhận mật khẩu mới..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "⏳ Đang cập nhật..." : "💾 LƯU MẬT KHẨU MỚI"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Link href="/" style={{ color: "#64748b", fontWeight: "700", textDecoration: "none" }}>
              🏠 Trở về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}