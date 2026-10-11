import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function DocumentDetail({ params }: { params: Promise<{id:string}> }) {
  const { id } = await params;
  const [doc,user] = await Promise.all([
    prisma.document.findUnique({ where:{id}, include:{uploadedBy:{select:{email:true}}} }),
    getCurrentUser(),
  ]);
  if (!doc) notFound();
  return <div className="container" style={{padding:"48px 0 80px",maxWidth:900}}><Link href="/documents" className="muted">← Quay lại</Link><div className="card" style={{padding:28,marginTop:14}}>
    <div style={{fontSize:13,fontWeight:700,color:"#6b7280"}}>{doc.subject} · {doc.grade}</div><h1 style={{fontSize:38,margin:"8px 0 14px"}}>{doc.title}</h1>
    <p style={{whiteSpace:"pre-wrap",lineHeight:1.7}}>{doc.description || "Không có mô tả."}</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12,margin:"24px 0"}}>
      <div><div className="muted" style={{fontSize:12}}>Chủ đề/chương</div><strong>{doc.chapter || "—"}</strong></div>
      <div><div className="muted" style={{fontSize:12}}>Dung lượng</div><strong>{(doc.sizeBytes/1024/1024).toFixed(2)} MB</strong></div>
      <div><div className="muted" style={{fontSize:12}}>Tên file</div><strong>{doc.originalName}</strong></div>
      <div><div className="muted" style={{fontSize:12}}>Lượt tải</div><strong>{doc.downloadCount}</strong></div>
    </div>
    {user?.emailVerifiedAt ? <a className="btn btn-primary" href={`/api/download/${doc.id}`}>Tải PowerPoint</a> : <div style={{padding:14,background:"#f3f4f6",borderRadius:10}}>Bạn cần <Link href="/auth/login" style={{fontWeight:800,textDecoration:"underline"}}>đăng nhập</Link> và xác minh email để tải tài liệu.</div>}
    {user?.role === "ADMIN" && <div style={{marginTop:18}}><Link href={`/admin/documents/${doc.id}`} style={{fontWeight:700}}>Sửa tài liệu →</Link></div>}
  </div></div>;
}
