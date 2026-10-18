"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUpload(){
  const [file,setFile]=useState<File|null>(null);const[error,setError]=useState("");const[status,setStatus]=useState("");const router=useRouter();
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");setStatus("");const fd=new FormData(e.currentTarget);if(!file){setError("Chọn file .ppt hoặc .pptx");return}setStatus("Đang cấp URL upload…");
    const pre=await fetch("/api/admin/uploads/presign",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:file.name,size:file.size,type:file.type||"application/octet-stream"})});const pd=await pre.json().catch(()=>({}));if(!pre.ok){setError(pd.error||"Không thể upload");return}
    setStatus("Đang upload file…");const put=await fetch(pd.uploadUrl,{method:"PUT",headers:{"content-type":file.type||"application/octet-stream"},body:file});if(!put.ok){setError("Upload lên storage thất bại");return}
    setStatus("Đang lưu thông tin…");const meta={title:fd.get("title"),subject:fd.get("subject"),grade:fd.get("grade"),chapter:fd.get("chapter")||null,description:fd.get("description")||null,originalName:file.name,storageKey:pd.key,mimeType:file.type||"application/octet-stream",sizeBytes:file.size};const res=await fetch("/api/admin/documents",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(meta)});const d=await res.json().catch(()=>({}));if(!res.ok){setError(d.error||"Không thể tạo tài liệu");return}setStatus("Upload xong.");router.push(`/admin/documents/${d.document.id}`);router.refresh();
  }
  return <form onSubmit={submit} className="card" style={{padding:24,maxWidth:760}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div><label className="label">Tên tài liệu</label><input className="input" name="title" required maxLength={200}/></div><div><label className="label">Môn học</label><input className="input" name="subject" placeholder="Toán, Văn, Anh…" required/></div><div><label className="label">Lớp</label><input className="input" name="grade" placeholder="9" required/></div><div><label className="label">Chương/chủ đề</label><input className="input" name="chapter" maxLength={120}/></div></div>
    <label className="label" style={{marginTop:14}}>Mô tả</label><textarea className="input" name="description" rows={5} maxLength={5000}/>
    <label className="label" style={{marginTop:14}}>File PowerPoint</label><input className="input" type="file" accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={e=>setFile(e.target.files?.[0]||null)} required/>
    <div className="muted" style={{fontSize:12,marginTop:6}}>Chỉ .ppt/.pptx, tối đa 50 MB.</div>{error&&<div style={{marginTop:12,color:"#b91c1c"}}>{error}</div>}{status&&<div style={{marginTop:12,color:"#166534"}}>{status}</div>}<button className="btn btn-primary" style={{marginTop:18}}>Upload tài liệu</button>
  </form>
}
