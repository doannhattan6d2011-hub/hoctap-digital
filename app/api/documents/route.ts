import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "documents.json");
    
    // Nếu file chưa tồn tại (chạy trên Vercel), trả về danh sách rỗng để không bị sập trang
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([]);
    }

    const fileData = fs.readFileSync(filePath, "utf8");
    const documents = JSON.parse(fileData || "[]");

    return NextResponse.json(documents);
  } catch (error) {
    // Bọc Try-Catch an toàn tuyệt đối cho Vercel
    return NextResponse.json([], { status: 200 });
  }
}