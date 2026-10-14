import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        originalName: true,
        subject: true,
        grade: true,
        createdAt: true,
        downloadCount: true,
      },
    });

    return NextResponse.json(
      documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description ?? "",
        fileName: doc.originalName,
        subject: doc.subject,
        grade: doc.grade,
        createdAt: doc.createdAt.toISOString(),
        downloadCount: doc.downloadCount,
      })),
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("GET /api/documents:", error);
    return NextResponse.json(
      { message: "Không thể tải danh sách tài liệu." },
      { status: 500 }
    );
  }
}
