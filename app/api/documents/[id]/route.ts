import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headObject } from "@/lib/storage";

// Lấy danh sách tài liệu
export async function GET() {
  try {
    await requireAdmin();
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải danh sách tài liệu" }, { status: 500 });
  }
}

// Lưu thông tin tài liệu mới sau khi upload
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const body = await request.json();

    const { title, subject, grade, chapter, description, originalName, storageKey, mimeType, sizeBytes } = body;

    // Validate các trường bắt buộc
    if (!title || !subject || !grade || !storageKey || !originalName) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ các thông tin bắt buộc (Tiêu đề, Môn học, Khối lớp, File)" },
        { status: 400 }
      );
    }

    // Kiểm tra xem file đã xuất hiện trên Storage chưa (optional check)
    try {
      await headObject(storageKey);
    } catch (storageErr) {
      console.warn("Không thể xác minh file trên Storage, tiếp tục lưu DB:", storageErr);
    }

    // Ghi metadata vào Database
    const newDocument = await prisma.document.create({
      data: {
        title,
        subject,
        grade,
        chapter: chapter || null,
        description: description || null,
        originalName,
        storageKey,
        mimeType: mimeType || "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        sizeBytes: Number(sizeBytes) || 0,
        uploadedById: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo tài liệu thành công",
      document: newDocument,
    });
  } catch (error: any) {
    console.error("Lỗi POST Document:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Lỗi hệ thống khi lưu tài liệu: " + (error.message || "") },
      { status: 500 }
    );
  }
}