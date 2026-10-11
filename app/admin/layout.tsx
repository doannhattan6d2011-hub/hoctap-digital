"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Đọc thông tin từ bộ nhớ trình duyệt thay vì Cookie để không bao giờ bị kẹt
    const userInfo = localStorage.getItem("user_info");
    
    if (!userInfo) {
      router.replace("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(userInfo);
      // Nếu không phải là Admin -> Đá về trang chủ
      if (user.role !== "admin") {
        alert("Bạn không có quyền vào trang Quản Trị!");
        router.replace("/");
      } else {
        // Đúng Admin thì cho phép hiển thị
        setIsAuth(true);
      }
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  if (!isAuth) {
    return (
      <div style={{ padding: "100px", textAlign: "center", fontFamily: "sans-serif", fontWeight: "bold", color: "#2563eb" }}>
        ⏳ Đang kiểm tra quyền truy cập hệ thống...
      </div>
    );
  }

  // Nếu là Admin thì hiển thị toàn bộ trang Admin bên trong
  return <>{children}</>;
}