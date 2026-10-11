# CHECKLIST TRIỂN KHAI

## Local

- [ ] Node.js cài xong
- [ ] `npm install`
- [ ] `.env.local` có đủ biến
- [ ] PostgreSQL hoạt động
- [ ] R2 bucket private
- [ ] Resend sender hoạt động
- [ ] `npx prisma migrate dev`
- [ ] `npm run db:seed`
- [ ] `npm run dev`

## Test bảo mật

- [ ] Guest không tải được
- [ ] USER chưa verify không tải được
- [ ] USER không upload được
- [ ] USER không sửa/xóa được
- [ ] USER không gọi được admin API
- [ ] Chỉ ADMIN_EMAIL làm ADMIN
- [ ] File sai đuôi bị từ chối
- [ ] File > 50 MB bị từ chối
- [ ] Object không có public URL

## Production

- [ ] GitHub repo
- [ ] Vercel project
- [ ] Production environment variables
- [ ] `APP_URL` là domain thật
- [ ] `npx prisma migrate deploy`
- [ ] `npm run db:seed`
- [ ] R2 CORS cho domain thật
- [ ] Domain Vercel/custom domain
- [ ] Test register/verify/login/download/upload
