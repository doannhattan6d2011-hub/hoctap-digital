import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import React from "react";

// ============================================================================
// 1. CẤU HÌNH FONT CHỮ VÀ VIEWPORT (BẢO VỆ GIAO DIỆN DI ĐỘNG)
// ============================================================================
const inter = Inter({ 
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

// ============================================================================
// 2. CẤU HÌNH METADATA (SEO & THƯƠNG HIỆU PHAN THỊ PHƯƠNG)
// ============================================================================
export const metadata: Metadata = {
  title: {
    template: "%s | Học Liệu Số Phan Thị Phương",
    default: "Hệ Thống Kho Học Liệu Số | Phan Thị Phương",
  },
  description: "Nền tảng lưu trữ, quản lý và chia sẻ giáo án, bài giảng điện tử chất lượng cao dành cho giáo viên và học sinh. Bản quyền thuộc về Phan Thị Phương.",
  keywords: ["Học liệu số", "Giáo án Ngữ Văn", "Bài giảng điện tử", "Phan Thị Phương", "Giáo dục", "E-learning"],
  authors: [{ name: "Phan Thị Phương" }],
  creator: "Phan Thị Phương",
  publisher: "Học Tập Digital",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://phuongphanthi.vercel.app",
    title: "Kho Học Liệu Số | Phan Thị Phương",
    description: "Nền tảng quản lý bài giảng và tài liệu học tập trực tuyến.",
    siteName: "Học Tập Digital",
    images: [
      {
        url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "Học Liệu Số Phan Thị Phương",
      },
    ],
  },
};

// ============================================================================
// 3. TOÀN BỘ CSS TOÀN CỤC (GLOBAL STYLES RESET)
// ============================================================================
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    :root {
      --primary-color: #2563eb;
      --primary-hover: #1d4ed8;
      --secondary-color: #1e293b;
      --bg-color: #f8fafc;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
    }

    /* Reset CSS */
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: var(--bg-color);
      color: var(--text-main);
      font-family: var(--font-inter), sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      scroll-behavior: smooth;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    a {
      text-decoration: none;
      color: inherit;
    }

    button, input, textarea, select {
      font-family: inherit;
      outline: none;
    }

    /* Tùy chỉnh thanh cuộn (Scrollbar) */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9; 
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1; 
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8; 
    }

    /* Hiệu ứng Nạp Trang Tùy Chỉnh (Tắt màn hình chờ mặc định) */
    #nprogress {
      pointer-events: none;
    }
    #nprogress .bar {
      background: var(--primary-color);
      position: fixed;
      z-index: 1031;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
    }

    /* Utilities */
    .glass-effect {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }

    /* Animation Fade In Global */
    @keyframes fadeInLayout {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-layout {
      animation: fadeInLayout 0.4s ease-out forwards;
    }
  `}} />
);

// ============================================================================
// 4. MAIN COMPONENT: ROOT LAYOUT TRÁI TIM CỦA ỨNG DỤNG
// ============================================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        {/* Nạp các cấu hình mở rộng nếu cần thiết */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <GlobalStyles />
        
        {/* Vùng thông báo Toast Toàn Cục (Trống sẵn để Client Component dùng) */}
        <div id="global-toast-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}></div>

        {/* Nội dung trang chính (Chèn component hiện tại vào đây) */}
        <main className="animate-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Lớp bọc an toàn chống vỡ layout */}
          <div style={{ flex: '1 0 auto', width: '100%' }}>
            {children}
          </div>
        </main>

        {/* Vùng chặn Script phụ */}
        <noscript>
          <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', textAlign: 'center', fontWeight: 'bold' }}>
            Hệ thống yêu cầu bật JavaScript để hoạt động. Vui lòng kiểm tra lại trình duyệt của bạn!
          </div>
        </noscript>
      </body>
    </html>
  );
}