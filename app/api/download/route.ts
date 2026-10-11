import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Chức năng tải xuống hiện đã được xử lý an toàn trực tiếp trên giao diện trình duyệt." },
    { status: 200 }
  );
}