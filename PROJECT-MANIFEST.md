# PROJECT MANIFEST

## Pages

- `/` trang chủ
- `/documents` kho học liệu + search/filter
- `/documents/[id]` chi tiết tài liệu
- `/auth/register` đăng ký
- `/auth/login` đăng nhập
- `/auth/forgot-password` quên mật khẩu
- `/auth/reset-password` đặt lại mật khẩu
- `/auth/verify-email` xác minh email
- `/account` tài khoản
- `/admin` dashboard
- `/admin/new` upload
- `/admin/documents` quản lý tài liệu
- `/admin/documents/[id]` sửa/xóa
- `/admin/users` người dùng
- `/admin/downloads` lịch sử tải
- `/admin/stats` thống kê

## API

- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/verify-email`
- `/api/auth/resend-verification`
- `/api/auth/forgot-password`
- `/api/auth/reset-password`
- `/api/admin/uploads/presign`
- `/api/admin/documents`
- `/api/admin/documents/[id]`
- `/api/admin/users`
- `/api/admin/users/[id]`
- `/api/admin/downloads`
- `/api/download/[id]`

## Data model

- User
- Session
- VerificationToken
- PasswordResetToken
- Document
- Download
