# HƯỚNG DẪN A → Z: ĐƯA HOCTAP DIGITAL LÊN INTERNET

Tài liệu này là đường đi từ thư mục source hiện tại đến một website thật.
Mục tiêu cuối:

1. Người lạ xem được kho và thông tin tài liệu.
2. Muốn tải phải đăng ký → xác minh email → đăng nhập.
3. Người đăng ký luôn là USER.
4. Chỉ đúng email trong `ADMIN_EMAIL` mới là ADMIN.
5. Chỉ ADMIN mới upload/sửa/xóa.
6. File PPT/PPTX nằm trong bucket private, không public URL.
7. Download đi qua backend, kiểm tra quyền rồi mới tạo URL tải tạm.

## 0. Các tài khoản cần tạo

Bạn cần 4 thứ:

- GitHub: lưu source code.
- Vercel: chạy website Next.js.
- PostgreSQL: lưu user/tài liệu/log. Neon là lựa chọn đơn giản.
- Cloudflare R2: lưu file PPT/PPTX private.
- Resend: gửi email xác minh/reset.

Bạn không cần tự thuê VPS cho cấu hình này.

## 1. Chuẩn bị máy

Cài Node.js 22 LTS hoặc một bản Node mới đáp ứng yêu cầu của project.
Sau đó mở Terminal/PowerShell trong thư mục project:

```bash
cd hoctap-digital
npm install
npm run db:generate
```

Kiểm tra:

```bash
node -v
npm -v
```

## 2. Tạo PostgreSQL

Tạo một database PostgreSQL trên nhà cung cấp bạn chọn. Neon là lựa chọn tiện vì có connection string PostgreSQL dùng được với Prisma/Vercel.

Lấy connection string dạng:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

Không đăng connection string lên GitHub.

## 3. Tạo Cloudflare R2

Trong Cloudflare:

1. Mở R2.
2. Tạo bucket, ví dụ `hoctap-private`.
3. Không bật public access cho bucket.
4. Vào R2 API Tokens.
5. Tạo token có `Object Read & Write`.
6. Nên giới hạn token chỉ vào bucket `hoctap-private`.
7. Copy `Access Key ID` và `Secret Access Key` ngay lúc tạo.

Endpoint dùng dạng:

```text
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

Điền:

```env
R2_ENDPOINT="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET="hoctap-private"
R2_REGION="auto"
```

### CORS R2

Presigned PUT từ trình duyệt cần CORS cho origin website.
Ở production cho phép đúng domain website của bạn, ví dụ:

```text
https://your-project.vercel.app
```

Không mở `*` nếu không cần.

## 4. Tạo Resend

Tạo tài khoản Resend, tạo API key và xác minh sender/domain.

Điền:

```env
RESEND_API_KEY="re_xxxxxxxxx"
MAIL_FROM="HocTap <noreply@your-domain.com>"
```

Trong lúc test có thể dùng sender được Resend cho phép theo trạng thái tài khoản, còn production nên dùng domain đã xác minh.

## 5. Tạo file môi trường local

Copy `.env.example` thành `.env.local`.

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Sửa toàn bộ giá trị:

```env
DATABASE_URL="..."
APP_URL="http://localhost:3000"
SESSION_COOKIE_NAME="hoctap_session"
ADMIN_EMAIL="email-cua-ban@example.com"
ADMIN_PASSWORD="MAT_KHAU_DAI_IT_NHAT_12_KY_TU"
RESEND_API_KEY="..."
MAIL_FROM="HocTap <noreply@your-domain.com>"
R2_ENDPOINT="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET="hoctap-private"
R2_REGION="auto"
MAX_FILE_SIZE_MB="50"
APP_SECRET="mot-chuoi-bi-mat-dai"
```

Tạo secret mới:

```bash
openssl rand -base64 48
```

Nếu không có OpenSSL, dùng một password/random secret dài và khó đoán.

## 6. Tạo database schema

Local/dev:

```bash
npx prisma migrate dev
npm run db:generate
```

Trong project này đã có migration đầu tiên tại:

```text
prisma/migrations/00000000000000_init/migration.sql
```

Production/CI:

```bash
npx prisma migrate deploy
```

## 7. Tạo ADMIN duy nhất

Đặt:

```env
ADMIN_EMAIL="email-cua-ban@example.com"
ADMIN_PASSWORD="mat-khau-cua-ban"
```

Sau đó:

```bash
npm run db:seed
```

Seed sẽ tạo hoặc cập nhật tài khoản email này thành ADMIN.

Quan trọng: form đăng ký website không có lựa chọn ADMIN. Người dùng mới luôn `USER`.

## 8. Chạy website local

```bash
npm run dev
```

Mở:

```text
http://localhost:3000
```

## 9. Test luồng USER

Test đúng thứ tự:

```text
Trang chủ
→ Đăng ký
→ Kiểm tra email
→ Bấm xác minh
→ Đăng nhập
→ Vào kho học liệu
→ Mở tài liệu
→ Tải file
```

Test thêm:

- chưa đăng nhập mà gọi `/api/download/<id>` → phải bị từ chối;
- chưa xác minh email mà tải → bị từ chối;
- USER gọi API admin → bị từ chối;
- USER không thấy chức năng upload.

## 10. Test luồng ADMIN

Đăng nhập bằng `ADMIN_EMAIL`.
Vào:

```text
/admin
```

Các mục:

```text
Dashboard
Upload học liệu
Quản lý học liệu
Người dùng
Lịch sử tải
Thống kê
```

## 11. Cách upload PPT/PPTX

Vào:

```text
/admin/new
```

Điền:

- Tên tài liệu.
- Môn học.
- Lớp.
- Chương/chủ đề.
- Mô tả.
- Chọn `.ppt` hoặc `.pptx`.

Bấm `Upload tài liệu`.

Luồng phía sau là:

```text
Browser
→ POST /api/admin/uploads/presign
→ Backend kiểm tra ADMIN + tên + size
→ Backend tạo presigned PUT URL 5 phút
→ Browser PUT file trực tiếp vào R2 private
→ POST /api/admin/documents
→ Backend HEAD object
→ kiểm tra size
→ đọc vài byte đầu để kiểm tra PPT/PPTX
→ tạo Document trong PostgreSQL
```

Không upload file 50 MB xuyên qua API Next.js nên backend đỡ phải làm cục máy xúc bất đắc dĩ.

## 12. Cách USER tải file

USER mở tài liệu rồi bấm tải.

Luồng:

```text
Browser
→ GET /api/download/<id>
→ lấy session từ cookie httpOnly
→ kiểm tra user tồn tại
→ kiểm tra email đã xác minh
→ tìm Document
→ ghi Download(userId, documentId, time, IP, user-agent)
→ tăng downloadCount
→ tạo presigned GET URL 60 giây
→ redirect sang URL tải tạm
```

URL storage không được lưu công khai trên giao diện.

## 13. Sửa/xóa tài liệu

ADMIN vào:

```text
/admin/documents
```

Sửa metadata bằng PATCH.
Xóa tài liệu sẽ xóa object trong R2 và record trong PostgreSQL.

## 14. Quản lý USER

ADMIN vào:

```text
/admin/users
```

Có thể khóa/mở khóa USER.
USER bị khóa sẽ không tạo session tải tài liệu nữa vì `getCurrentUser()` kiểm tra `isActive`.

## 15. Push source lên GitHub

Tại thư mục project:

```bash
git init
git add .
git commit -m "Initial HocTap Digital"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hoctap-digital.git
git push -u origin main
```

Trước khi push, chắc chắn `.env.local` không được commit.
Project đã có `.gitignore` cho `.env.local`.

## 16. Deploy lên Vercel bằng GitHub

1. Mở Vercel.
2. Import repository GitHub.
3. Chọn project `hoctap-digital`.
4. Framework được nhận là Next.js.
5. Thêm Environment Variables.
6. Deploy.

Vercel hỗ trợ deploy Next.js trực tiếp và có preview deployment khi push/PR.

## 17. Environment Variables trên Vercel

Production cần:

```env
DATABASE_URL=...
APP_URL=https://YOUR-DOMAIN.com
SESSION_COOKIE_NAME=hoctap_session
ADMIN_EMAIL=email-cua-ban@example.com
ADMIN_PASSWORD=mat-khau-dai
RESEND_API_KEY=re_...
MAIL_FROM=HocTap <noreply@your-domain.com>
R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=hoctap-private
R2_REGION=auto
MAX_FILE_SIZE_MB=50
APP_SECRET=...
```

Không đặt secrets có tiền tố `NEXT_PUBLIC_`.

## 18. Migration production

Sau khi database production đã có `DATABASE_URL`:

```bash
npx prisma migrate deploy
```

Có thể chạy lệnh này từ CI hoặc môi trường deploy phù hợp.

## 19. Tạo ADMIN production

Cấu hình `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong production.
Sau đó chạy:

```bash
npm run db:seed
```

Không chạy seed lung tung mỗi lần deploy nếu bạn không cần. Seed hiện tại sẽ cập nhật password ADMIN thành giá trị `ADMIN_PASSWORD`.

## 20. Gắn domain riêng

Vercel:

```text
Project
→ Settings
→ Domains
→ Add Domain
```

Sau đó cập nhật:

```env
APP_URL=https://domain-cua-ban.vn
```

Đồng thời cập nhật CORS R2 và sender/email domain nếu cần.

## 21. Checklist bảo mật trước khi công khai

- [ ] R2 bucket private.
- [ ] R2 token chỉ có Read & Write cho bucket cần dùng.
- [ ] `.env.local` không nằm trong Git.
- [ ] `APP_SECRET` là chuỗi random dài.
- [ ] ADMIN password dài >= 12 ký tự.
- [ ] `ADMIN_EMAIL` chính xác.
- [ ] USER không thể tự chọn ADMIN.
- [ ] `/api/admin/*` kiểm tra ADMIN ở backend.
- [ ] `/api/download/*` kiểm tra login + verified email ở backend.
- [ ] Chỉ `.ppt` / `.pptx`.
- [ ] File tối đa 50 MB.
- [ ] Kiểm tra magic bytes sau upload.
- [ ] URL tải có thời hạn ngắn.
- [ ] R2 CORS chỉ cho domain cần thiết.
- [ ] Có log download.

## 22. Những thứ nên nâng cấp sau khi website chạy ổn

1. Rate limit cho login/register/forgot password.
2. CAPTCHA hoặc cơ chế chống abuse khi cần.
3. Quét antivirus file trước khi finalize document.
4. Pagination cho danh sách tài liệu, user, download log.
5. Tìm kiếm full-text nếu kho lớn.
6. Audit log cho hành động admin.
7. Backup database.
8. Monitoring/error tracking.

## 23. Cấu trúc project

```text
hoctap-digital/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── admin/
│   │   └── download/
│   ├── auth/
│   ├── documents/
│   ├── account/
│   ├── admin/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── docs/
│   └── A-Z.md
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
└── README.md
```

## 24. Nếu muốn chạy hoàn toàn bằng Vercel

Luồng chuẩn:

```text
GitHub
   ↓
Vercel / Next.js
   ↓
PostgreSQL (Neon hoặc provider khác)
   ↓
Cloudflare R2 private
   ↓
Resend
```

Vercel chạy web/API.
PostgreSQL lưu dữ liệu.
R2 lưu file.
Resend gửi email.

Đây là cách tách đúng việc đúng chỗ thay vì nhét file 50 MB vào database rồi khóc.
