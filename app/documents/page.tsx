import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Documents({ searchParams }: { searchParams: Promise<{q?:string;subject?:string;grade?:string}> }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const subject = params.subject?.trim() || "";
  const grade = params.grade?.trim() || "";
  const docs = await prisma.document.findMany({
    where: { AND: [q ? { OR: [{title:{contains:q,mode:"insensitive"}},{description:{contains:q,mode:"insensitive"}},{chapter:{contains:q,mode:"insensitive"}}] } : {}, subject ? {subject} : {}, grade ? {grade} : {}] },
    orderBy: { createdAt: "desc" },
  });
  const subjects = await prisma.document.findMany({distinct:["subject"],select:{subject:true},orderBy:{subject:"asc"}});
  const grades = await prisma.document.findMany({distinct:["grade"],select:{grade:true},orderBy:{grade:"asc"}});
  return <div className="container" style={{padding:"40px 0 70px"}}>
    <div style={{marginBottom:20}}><div className="muted" style={{fontSize:13}}>Kho học liệu</div><h1 style={{fontSize:38,margin:"5px 0"}}>Tất cả tài liệu</h1></div>
    <form className="card" style={{padding:16,display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:10,marginBottom:22}}>
      <input className="input" name="q" defaultValue={q} placeholder="Tìm tên, chương, mô tả…" />
      <select className="input" name="subject" defaultValue={subject}><option value="">Tất cả môn</option>{subjects.map(x=><option key={x.subject}>{x.subject}</option>)}</select>
      <select className="input" name="grade" defaultValue={grade}><option value="">Tất cả lớp</option>{grades.map(x=><option key={x.grade}>{x.grade}</option>)}</select>
      <button className="btn btn-primary" type="submit">Lọc</button>
    </form>
    <div className="grid-auto">
      {docs.map(d=><Link key={d.id} href={`/documents/${d.id}`} className="card" style={{padding:20}}><div style={{fontSize:12,fontWeight:700,color:"#6b7280"}}>{d.subject} · {d.grade}</div><h2 style={{fontSize:19,margin:"10px 0 7px"}}>{d.title}</h2><p className="muted" style={{fontSize:13,lineHeight:1.5}}>{d.description || "Không có mô tả."}</p><div className="muted" style={{fontSize:12,marginTop:12}}>{d.chapter || "Không phân chương"} · {d.downloadCount} lượt tải</div></Link>)}
      {!docs.length && <div className="card" style={{padding:24}}>Không tìm thấy tài liệu phù hợp.</div>}
    </div>
  </div>;
}
