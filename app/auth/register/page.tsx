"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ============================================================================
// 1. CẤU TRÚC GIAO DIỆN VÀ ANIMATION ĐĂNG KÝ
// ============================================================================
const RegisterStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    
    .auth-container {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .auth-card {
      background: #ffffff;
      width: 100%;
      max-width: 460px;
      border-radius: 24px;
      padding: 48px 40px;
      box-shadow: 0 20px 25px -5px rgba(22, 163, 74, 0.1), 0 8px 10px -6px rgba(22, 163, 74, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.8);
      position: relative;
      overflow: hidden;
    }

    .auth-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 6px;
      background: linear-gradient(90deg, #10b981, #059669, #047857);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-title {
      font-size: 26px;
      font-weight: 900;
      color: #064e3b;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .auth-subtitle {
      font-size: 14px;
      color: #475569;
      margin: 0;
      line-height: 1.6;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-input {
      width: 100%;
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      font-size: 15px;
      color: #0f172a;
      background: #f8fafc;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      border-color: #10b981;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
      outline: none;
    }

    .btn-submit {
      width: 100%;
      padding: 16px;
      background: #10b981;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 24px;
    }

    .btn-submit:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
    }

    .btn-submit:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }

    .auth-footer {
      text-align: center;
      margin-top: 32px;
      font-size: 14px;
      color: #64748b;
    }

    .auth-link {
      color: #10b981;
      font-weight: 700;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .auth-link:hover {
      color: #047857;
      text-decoration: underline;
    }

    .alert-msg {
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alert-error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .alert-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  `}} />
);

// ============================================================================
// 2. COMPONENT CHÍNH: TRANG ĐĂNG KÝ HỆ THỐNG
// ============================================================================
export default function RegisterPage() {
  const router = useRouter();
  
  // Trạng thái quản lý Form
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const cleanName = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Validation cơ bản
    if (!cleanName || !cleanEmail || !cleanPassword) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (cleanPassword.length < 6) {
      setError("Mật khẩu phải có độ dài tối thiểu 6 ký tự.");
      return;
    }

    setLoading(true);

    try {
      // Xác định quyền hạn: Nếu đăng ký bằng email có chữ "admin" hoặc "phanthiphuong" thì gán thẳng quyền Admin
      let userRole = "user";
      let displayName = cleanName;

      if (cleanEmail.includes("admin") || cleanEmail.includes("phanthiphuong")) {
        userRole = "admin";
        displayName = "Phan Thị Phương"; // Cố định tên thương hiệu
      }

      // Ghi dữ liệu vào bảng Profiles trên Supabase
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ 
          email: cleanEmail, 
          password: cleanPassword, 
          username: displayName, 
          role: userRole 
        }]);

      if (insertError) {
        if (insertError.code === '23505') { // Mã lỗi Duplicate Key (Đã tồn tại) của PostgreSQL
          setError("Địa chỉ Email này đã được đăng ký. Vui lòng dùng email khác!");
        } else {
          setError("Lỗi máy chủ Supabase: " + insertError.message);
        }
        setLoading(false);
        return;
      }

      // Đăng ký thành công
      setSuccess(true);
      
      // Chuyển hướng sang trang Đăng nhập sau 2 giây
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);

    } catch (err: any) {
      setError("Đã xảy ra lỗi mạng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <>
      <RegisterStyles />
      <div className="auth-container">
        <div className="auth-card">
          
          <div className="auth-header">
            <h1 className="auth-title">TẠO TÀI KHOẢN MỚI</h1>
            <p className="auth-subtitle">Trở thành thành viên của Hệ thống Học liệu số</p>
          </div>

          {error && (
            <div className="alert-msg alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="alert-msg alert-success">
              <span>✅</span> Đăng ký thành công! Đang chuyển hướng đến Đăng nhập...
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Họ và Tên</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="VD: Nguyễn Văn A..." 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Nhập email liên hệ..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu bảo mật</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Tạo mật khẩu (ít nhất 6 ký tự)..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading || success}>
              {loading ? (
                <>⏳ ĐANG XỬ LÝ DỮ LIỆU...</>
              ) : success ? (
                <>✅ HOÀN TẤT ĐĂNG KÝ</>
              ) : (
                <>🚀 ĐĂNG KÝ TÀI KHOẢN</>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Bạn đã có tài khoản rồi? <Link href="/auth/login" className="auth-link">Đăng nhập ngay</Link>
          </div>

        </div>
      </div>
    </>
  );
}