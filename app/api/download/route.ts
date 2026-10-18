import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createDownloadUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

if (!user) {
  return NextResponse.json(
    { message: "Không tìm thấy phiên đăng nhập. Hãy đăng xuất rồi đăng nhập lại." },
    { status: 401 }
  );
}

if (!user.emailVerifiedAt) {
  return NextResponse.json(
    { message: "Tài khoản chưa xác minh email." },
    { status: 403 }
  );
}
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Thiếu mã tài liệu." },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        storageKey: true,
        uploadedById: true,
      },
    });

    if (!doc) {
      return NextResponse.json(
        { message: "Không tìm thấy tài liệu." },
        { status: 404 }
      );
    }

    const url = await createDownloadUrl(doc.storageKey);

    await prisma.$transaction([
      prisma.document.update({
        where: { id: doc.id },
        data: { downloadCount: { increment: 1 } },
      }),
      prisma.download.create({
        data: {
          userId: user.id,
          documentId: doc.id,
          userAgent: request.headers.get("user-agent")?.slice(0, 500),
        },
      }),
    ]);

    return NextResponse.redirect(url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "Vui lòng đăng nhập và xác minh email trước khi tải." },
        { status: 401 }
      );
    }

    console.error("GET /api/download:", error);
    return NextResponse.json(
      { message: "Không thể tải tài liệu." },
      { status: 500 }
    );
  }
}
