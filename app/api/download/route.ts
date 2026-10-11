import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("id");

    if (!docId) {
      return NextResponse.json({ message: "Thiếu ID bài giảng!" }, { status: 400 });
    }

    // 1. Đọc dữ liệu từ file JSON
    const dataFilePath = path.join(process.cwd(), "data", "documents.json");
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ message: "Chưa có cơ sở dữ liệu documents.json" }, { status: 404 });
    }

    const fileContent = await readFile(dataFilePath, "utf-8");
    const documents = JSON.parse(fileContent || "[]");
    const targetDoc = documents.find((doc: any) => String(doc.id) === String(docId));

    if (!targetDoc) {
      return NextResponse.json({ message: "Không tìm thấy bài giảng trong Database!" }, { status: 404 });
    }

    // 2. Tìm file bài giảng thực tế trên đĩa (Thử tất cả các thư mục lưu trữ)
    const rawFileUrl = targetDoc.fileUrl || "";
    const cleanFileName = path.basename(rawFileUrl);

    const possiblePaths = [
      path.join(process.cwd(), "public", rawFileUrl),
      path.join(process.cwd(), "public", "uploads", cleanFileName),
      path.join(process.cwd(), "storage", "uploads", cleanFileName),
      path.join(process.cwd(), "uploads", cleanFileName),
    ];

    let foundFilePath = possiblePaths.find((p) => fs.existsSync(p));

    // Nếu không tìm thấy tệp khớp tên, tự động lấy tệp gần nhất trong thư mục public/uploads
    if (!foundFilePath) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        if (files.length > 0) {
          foundFilePath = path.join(uploadDir, files[files.length - 1]);
        }
      }
    }

    if (!foundFilePath) {
      return NextResponse.json({ message: "Tệp đính kèm không tồn tại trên máy chủ!" }, { status: 404 });
    }

    // 3. Xuất tệp về trình duyệt dưới dạng file tải xuống
    const fileBuffer = await readFile(foundFilePath);
    const downloadName = encodeURIComponent(targetDoc.fileName || targetDoc.title + ".pptx" || "BaiGiang.pptx");

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi xử lý file", error: error.message }, { status: 500 });
  }
}