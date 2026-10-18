// Lõi hệ thống xử lý dữ liệu an toàn, chống lỗi Vercel và Hydration của Next.js
export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  fileName: string;
  createdAt: string;
}

const DOCS_KEY = "hoctap_digital_docs";

export const Database = {
  getDocuments: (): DocumentItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(DOCS_KEY);
      if (data) return JSON.parse(data);
      
      // Dữ liệu mẫu cực đẹp nếu hệ thống trắng
      const demoData: DocumentItem[] = [
        {
          id: "demo-1",
          title: "Bài Giảng Điện Tử: Sự Tích Cây Khế",
          description: "Bài giảng PowerPoint môn Ngữ Văn lớp 6 chi tiết, sinh động, kết hợp âm thanh và hình ảnh trực quan giúp học sinh dễ tiếp thu.",
          imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800",
          fileName: "BaiGiang_CayKhe.pptx",
          createdAt: new Date().toISOString()
        },
        {
          id: "demo-2",
          title: "Giáo Án: Đi Lấy Mật (Đất Rừng Phương Nam)",
          description: "Trọn bộ giáo án điện tử trích đoạn Đi Lấy Mật của nhà văn Đoàn Giỏi. Bao gồm câu hỏi tương tác và sơ đồ tư duy.",
          imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800",
          fileName: "GiaoAn_DiLayMat.pdf",
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(DOCS_KEY, JSON.stringify(demoData));
      return demoData;
    } catch {
      return [];
    }
  },

  addDocument: (doc: Omit<DocumentItem, "id" | "createdAt">) => {
    if (typeof window === "undefined") return;
    const current = Database.getDocuments();
    const newDoc: DocumentItem = {
      ...doc,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(DOCS_KEY, JSON.stringify([newDoc, ...current]));
  },

  deleteDocument: (id: string) => {
    if (typeof window === "undefined") return;
    const current = Database.getDocuments();
    const filtered = current.filter(doc => doc.id !== id);
    localStorage.setItem(DOCS_KEY, JSON.stringify(filtered));
  }
};