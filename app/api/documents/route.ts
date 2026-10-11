import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  // Dữ liệu dự phòng ép hiển thị ngay lập tức trên Vercel
  const defaultDocs = [
    {
      id: "1791706944481",
      title: "Bài Giảng: Cây Khế (Bản chuẩn)",
      filename: "1791706944481-BaiGiang_CayKhe__1_.pptx",
      downloadUrl: "/uploads/1791706944481-BaiGiang_CayKhe__1_.pptx",
      createdAt: new Date().toISOString()
    }
  ];

  try {
    const filePath = path.join(process.cwd(), "data", "documents.json");
    
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf8");
      const documents = JSON.parse(fileData || "[]");
      // Nếu có dữ liệu thật thì hiện, nếu mảng rỗng thì hiện bản dự phòng
      if (documents.length > 0) {
        return NextResponse.json(documents);
      }
    }
    
    // Ép trả về danh sách có sẵn bài giảng Cây Khế
    return NextResponse.json(defaultDocs);
  } catch (error) {
    return NextResponse.json(defaultDocs, { status: 200 });
  }
}