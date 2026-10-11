import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "documents.json");

// Đọc danh sách tài liệu từ JSON
async function getStoredDocuments() {
  try {
    if (!fs.existsSync(dataFilePath)) return [];
    const fileData = await readFile(dataFilePath, "utf-8");
    return JSON.parse(fileData);
  } catch (error) {
    return [];
  }
}

// Lưu danh sách tài liệu vào JSON
async function saveDocuments(documents: any[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(documents, null, 2), "utf-8");
}

// 1. GET: Lấy toàn bộ danh sách bài học/file
export async function GET() {
  const documents = await getStoredDocuments();
  return NextResponse.json({ documents }, { status: 200 });
}

// 2. POST: Thêm mới bài học và lưu file thực tế
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let subject = "Ngữ Văn";
    let grade = "Lớp 9";
    let topic = "";
    let description = "";
    let fileUrl = "";
    let fileName = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = formData.get("title")?.toString() || "";
      subject = formData.get("subject")?.toString() || "Ngữ Văn";
      grade = formData.get("grade")?.toString() || "Lớp 9";
      topic = formData.get("topic")?.toString() || "";
      description = formData.get("description")?.toString() || "";
      
      const file = formData.get("file") as File | null;

      if (file && typeof file !== "string" && file.name) {
        fileName = file.name;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = path.join(uploadDir, safeName);
        
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/${safeName}`;
      }
    }

    if (!title) {
      return NextResponse.json({ message: "Thiếu tên tài liệu" }, { status: 400 });
    }

    const newDoc = {
      id: Date.now().toString(),
      title,
      subject,
      grade,
      topic,
      description,
      fileUrl: fileUrl || "/uploads/sample.pptx",
      fileName: fileName || "BaiGiang.pptx",
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    const currentDocs = await getStoredDocuments();
    currentDocs.unshift(newDoc);
    await saveDocuments(currentDocs);

    return NextResponse.json({ message: "Thành công!", document: newDoc }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi server", error: error.message }, { status: 500 });
  }
}

// 3. DELETE: Xóa bài học theo ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID tài liệu cần xóa" }, { status: 400 });
    }

    let documents = await getStoredDocuments();
    const docToDelete = documents.find((doc: any) => doc.id === id);

    if (docToDelete && docToDelete.fileUrl) {
      if (!docToDelete.fileUrl.includes("sample.pptx")) {
        const filePath = path.join(process.cwd(), "public", docToDelete.fileUrl);
        if (fs.existsSync(filePath)) {
          await unlink(filePath).catch(() => {});
        }
      }
    }

    documents = documents.filter((doc: any) => doc.id !== id);
    await saveDocuments(documents);

    return NextResponse.json({ message: "Xóa tài liệu thành công" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Lỗi khi xóa tài liệu", error: error.message }, { status: 500 });
  }
}