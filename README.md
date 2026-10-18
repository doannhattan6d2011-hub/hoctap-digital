# HocTap Digital

Website học liệu số cho file PowerPoint `.ppt` / `.pptx`.

## Mục tiêu

- Guest: xem trang và danh sách học liệu.
- USER: đăng ký, xác minh email, đăng nhập, tìm tài liệu, tải tài liệu.
- ADMIN: upload/sửa/xóa học liệu, quản lý user, xem lịch sử tải và thống kê.
- Người đăng ký mới luôn là `USER`.
- Chỉ email cấu hình trong `ADMIN_EMAIL` mới có thể là `ADMIN`.
- R2 bucket private; backend kiểm tra quyền trước upload/download.

## Đọc tài liệu này trước

**[Hướng dẫn A → Z](./docs/A-Z.md)**

Các tài liệu phụ:

- [Luồng upload/download](./docs/FILE-UPLOAD-FLOW.md)
- [Checklist triển khai](./docs/DEPLOY-CHECKLIST.md)

## Chạy local

```bash
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run db:generate
npm run db:seed
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
npm install
npx prisma migrate dev
npm run db:generate
npm run db:seed
npm run dev
```

Mở `http://localhost:3000`.

## Deploy

Kiến trúc khuyến nghị:

```text
GitHub → Vercel/Next.js
                 ├── PostgreSQL
                 ├── Cloudflare R2 private
                 └── Resend
```

Production migration:

```bash
npx prisma migrate deploy
```

Không commit `.env.local` và secret.
