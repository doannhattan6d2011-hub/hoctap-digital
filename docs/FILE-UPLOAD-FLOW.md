# LUỒNG UPLOAD VÀ DOWNLOAD

## Upload

```text
ADMIN browser
  |
  | POST /api/admin/uploads/presign
  v
Next.js
  |
  | requireAdmin()
  | kiểm tra .ppt/.pptx
  | kiểm tra <= 50 MB
  v
Presigned PUT URL
  |
  | PUT file trực tiếp
  v
Cloudflare R2 private bucket
  |
  | POST metadata
  v
Next.js
  |
  | HEAD object
  | magic bytes check
  v
PostgreSQL Document
```

## Download

```text
USER browser
  |
  | GET /api/download/:id
  v
Next.js
  |
  | session cookie
  | isActive
  | emailVerifiedAt
  v
PostgreSQL
  |
  | create Download log
  | increment downloadCount
  v
Presigned GET URL 60s
  |
  v
R2 private object
```

## Quy tắc quan trọng

Không đưa `storageKey` ra thành URL công khai.
Không chỉ dựa vào việc ẩn nút upload/download trên frontend.
Mọi quyền quan trọng phải được kiểm tra ở backend.
