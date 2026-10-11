"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ.");
      return;
    }

    if (password.length < 12) {
      setError("Mật khẩu mới phải có ít nhất 12 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Không thể đặt lại mật khẩu.");
        return;
      }

      setMessage(
        "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
      );

      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Không thể kết nối tới máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Đặt lại mật khẩu
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Tạo mật khẩu mới cho tài khoản của bạn.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Mật khẩu mới
            </label>

            <input
              type="password"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-600"
              placeholder="Ít nhất 12 ký tự"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Nhập lại mật khẩu
            </label>

            <input
              type="password"
              required
              minLength={12}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-600"
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>

        <a
          href="/auth/login"
          className="mt-5 block text-center text-sm text-slate-600 hover:underline"
        >
          ← Quay lại đăng nhập
        </a>
      </div>
    </main>
  );
}