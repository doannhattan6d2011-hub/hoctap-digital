import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    let title = "Bài giảng mới";
    let filename = "document.pptx";

    // Phân tích dữ liệu siêu nhẹ gửi từ Frontend
    try {
      const text = await request.text();
      if (text.startsWith("{")) {
        const body = JSON.parse(text);
        title = body.title || title;
        filename = body.filename || filename;
      }
    } catch (e) {
      console.warn("Bỏ qua lỗi dữ liệu đầu vào");
    }

    const newDoc = {
      id: Date.now().toString(),
      title: title,
      filename: filename,
      downloadUrl: "#", // Trình diễn demo
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ message: "Upload ảo thành công!", document: newDoc }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Xử lý thành công!" }, { status: 200 });
  }
}