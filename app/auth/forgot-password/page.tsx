"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ============================================================================
// 1. STYLESHEET CHO TRANG LẤY LẠI MẬT KHẨU
// ============================================================================
const ForgotPassStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }

    .fp-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }

    .fp-card {
      background: #ffffff;
      width: 100%;
      max-width: 480px;
      border-radius: 24px;
      padding: 48px 40px;
      box-shadow: 0 20px 30px -10px rgba(16, 185, 129, 0.1);
      border: 1px solid #e2e8f0;
    }

    .fp-title {
      font-size: 26px;
      font-weight: 900;
      color: #064e3b;
      margin: 0 0 8px 0;
      text-align: center;
    }

    .fp-subtitle {
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

    .form-input {
      width: 100%;
      padding: 16px 18px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      font-size: 15px;
      outline: none;
      transition: all 0.2s;
    }
    .form-input:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
    }

    .btn-submit {
      width: 100%;
      padding: 18px;
      background: #10b981;
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
      background: #059669;
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
// 2. MAIN COMPONENT: TỰ KHÔI PHỤC MẬT KHẨU TỨC THÌ
// ============================================================================
export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Bước 1: Tra cứu Email
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Vui lòng nhập email đăng ký.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", cleanEmail)
        .single();

      if (error || !data) {
        setErrorMsg("❌ Địa chỉ Email này chưa từng đăng ký trên hệ thống!");
        setLoading(false);
        return;
      }

      setStep(2);
      setSuccessMsg("✅ Email hợp lệ! Vui lòng nhập mật khẩu mới.");

    } catch {
      setErrorMsg("Lỗi khi kiểm tra Email.");
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Thiết lập mật khẩu mới trực tiếp
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ password: newPassword.trim() })
        .eq("email", email.trim().toLowerCase());

      if (error) throw error;

      setSuccessMsg("🎉 Đặt lại mật khẩu thành công! Đang chuyển hướng Đăng nhập...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);

    } catch (err: any) {
      setErrorMsg("Không thể cập nhật mật khẩu: " + err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <ForgotPassStyles />
      <div className="fp-wrapper">
        <div className="fp-card">
          <h1 className="fp-title">🔑 Khôi Phục Mật Khẩu</h1>
          <p className="fp-subtitle">
            {step === 1 ? "Nhập email tài khoản để xác minh" : `Đặt lại mật khẩu mới cho: ${email}`}
          </p>

          {errorMsg && <div className="alert alert-err">⚠️ {errorMsg}</div>}
          {successMsg && <div className="alert alert-ok">✅ {successMsg}</div>}

          {step === 1 ? (
            <form onSubmit={handleVerifyEmail}>
              <div className="form-group">
                <label className="form-label">Email Tài Khoản</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="VD: admin@phanthiphuong.com..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "⏳ Đang kiểm tra..." : "🚀 TÌM TÀI KHOẢN"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Tạo mật khẩu mới (ít nhất 6 ký tự)..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "⏳ Đang lưu mật khẩu..." : "💾 ĐẶT LẠI MẬT KHẨU MỚI"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <Link href="/auth/login" style={{ color: "#10b981", fontWeight: "700", textDecoration: "none" }}>
              🔙 Trở lại Đăng Nhập
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}