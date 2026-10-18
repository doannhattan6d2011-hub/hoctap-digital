"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ============================================================================
// 1. CẤU TRÚC GIAO DIỆN VÀ ANIMATION ĐĂNG NHẬP
// ============================================================================
const LoginStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    
    .auth-container {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .auth-card {
      background: #ffffff;
      width: 100%;
      max-width: 440px;
      border-radius: 24px;
      padding: 48px 40px;
      box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.8);
      position: relative;
      overflow: hidden;
    }

    .auth-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 6px;
      background: linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-title {
      font-size: 28px;
      font-weight: 900;
      color: #1e3a8a;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .auth-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      line-height: 1.6;
    }

    .form-group {
      margin-bottom: 24px;
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
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
      outline: none;
    }

    .btn-submit {
      width: 100%;
      padding: 16px;
      background: #2563eb;
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
      margin-top: 10px;
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

    .auth-footer {
      text-align: center;
      margin-top: 32px;
      font-size: 14px;
      color: #64748b;
    }

    .auth-link {
      color: #2563eb;
      font-weight: 700;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .auth-link:hover {
      color: #1e3a8a;
      text-decoration: underline;
    }

    .error-msg {
      background: #fef2f2;
      color: #b91c1c;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      border: 1px solid #fecaca;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `}} />
);

// ============================================================================
// 2. COMPONENT CHÍNH: TRANG ĐĂNG NHẬP (BẢO MẬT & ĐỒNG BỘ SESSION)
// ============================================================================
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Kiểm tra nếu đã đăng nhập thì đẩy thẳng ra trang chủ hoặc Admin
  useEffect(() => {
    const stored = localStorage.getItem("phanthiphuong_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } catch (e) {
        localStorage.removeItem("phanthiphuong_user");
      }
    }
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      // 1. Kiểm tra tài khoản dưới Database Supabase
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', cleanPassword)
        .single();

      if (dbError || !data) {
        // Cấp quyền khẩn cấp nếu đăng nhập bằng tài khoản admin mặc định nhưng DB bị xóa
        if (cleanEmail === "admin@phanthiphuong.com" && cleanPassword === "admin123456") {
          const emergencyAdmin = {
            id: "admin-emergency",
            email: "admin@phanthiphuong.com",
            username: "Phan Thị Phương",
            role: "admin"
          };
          localStorage.setItem("phanthiphuong_user", JSON.stringify(emergencyAdmin));
          router.push("/admin");
          return;
        }

        setError("Email hoặc mật khẩu không chính xác. Vui lòng thử lại!");
        setLoading(false);
        return;
      }

      // 2. Tự động nâng cấp quyền Admin nếu email thuộc về Ban Quản Trị
      if (cleanEmail.includes("admin") || cleanEmail.includes("phanthiphuong")) {
        data.role = "admin";
        data.username = "Phan Thị Phương";
      }

      // 3. Lưu phiên đăng nhập hợp lệ vào LocalStorage
      localStorage.setItem("phanthiphuong_user", JSON.stringify(data));

      // 4. Chuyển hướng theo đúng quyền hạn
      if (data.role === 'admin') {
        window.location.href = "/admin"; // Dùng window.location để reset sạch DOM
      } else {
        window.location.href = "/";
      }

    } catch (err: any) {
      setError("Đã xảy ra lỗi kết nối. Vui lòng tải lại trang.");
      setLoading(false);
    }
  };

  return (
    <>
      <LoginStyles />
      <div className="auth-container">
        <div className="auth-card">
          
          <div className="auth-header">
            <div style={{ width: "64px", height: "64px", background: "#2563eb", borderRadius: "16px", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "28px", fontWeight: "bold" }}>
              P
            </div>
            <h1 className="auth-title">PHAN THỊ PHƯƠNG</h1>
            <p className="auth-subtitle">Đăng nhập để truy cập kho học liệu số</p>
          </div>

          {error && (
            <div className="error-msg">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Địa chỉ Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Ví dụ: admin@phanthiphuong.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label className="form-label" style={{ margin: 0 }}>Mật khẩu bảo mật</label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Vui lòng liên hệ Admin để cấp lại mật khẩu!"); }} style={{ fontSize: "12px", color: "#64748b", textDecoration: "none" }}>Quên mật khẩu?</a>
              </div>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Nhập mật khẩu của bạn..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>⏳ Đang xác thực...</>
              ) : (
                <>🚀 ĐĂNG NHẬP HỆ THỐNG</>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Chưa có tài khoản tham gia? <Link href="/auth/register" className="auth-link">Đăng ký ngay</Link>
          </div>

        </div>
      </div>
    </>
  );
}