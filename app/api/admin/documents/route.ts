import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { headObject, getObjectHeader } from "@/lib/storage";
import { sameOrigin } from "@/lib/http";
import { isAllowedFile } from "@/lib/validation";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ message: "Yêu cầu không hợp lệ." }, { status: 403 });
  }

  try {
    const user = await requireAdmin();
    const body = await request.json();

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const originalName = String(body.originalName || "").trim();
    const storageKey = String(body.key || "");
    const mimeType = String(body.mimeType || "application/octet-stream");
    const sizeBytes = Number(body.sizeBytes);
    const subject = String(body.subject || "Chưa phân loại").trim();
    const grade = String(body.grade || "Chưa phân loại").trim();

    if (!title || !originalName || !storageKey.startsWith("documents/")) {
      return NextResponse.json({ message: "Thiếu tên bài hoặc thông tin file." }, { status: 400 });
    }

    if (!isAllowedFile(originalName, sizeBytes)) {
      return NextResponse.json({ message: "Chỉ nhận file PPT/PPTX trong giới hạn dung lượng." }, { status: 400 });
    }

    const object = await headObject(storageKey);
    if (!object.ContentLength || object.ContentLength !== sizeBytes) {
      return NextResponse.json({ message: "Dung lượng file trên Storage không khớp." }, { status: 400 });
    }

    const header = await getObjectHeader(storageKey, 8);
    const isPptx = header[0] === 0x50 && header[1] === 0x4b;
    const isPpt = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]).equals(header.subarray(0, 8));

    if (!isPptx && !isPpt) {
      return NextResponse.json({ message: "Nội dung file không phải PowerPoint hợp lệ." }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        title,
        description: description || null,
        subject,
        grade,
        originalName,
        storageKey,
        mimeType,
        sizeBytes,
        uploadedById: user.id,
      },
      select: {
        id: true,
        title: true,
        originalName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: "Đã lưu tài liệu.", document }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "UNAUTHORIZED" || message === "FORBIDDEN") {
      return NextResponse.json({ message: "Tài khoản không có quyền đăng tài liệu." }, { status: 403 });
    }

    console.error("POST /api/admin/documents:", error);
    return NextResponse.json({ message: "Không thể lưu thông tin tài liệu." }, { status: 500 });
  }
}
