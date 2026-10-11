"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error,setError] = useState(""); const [message,setMessage] = useState(""); const [loading,setLoading]=useState(false); const router=useRouter();
  async function submit(e:FormEvent<HTMLFormElement>) { e.preventDefault(); setError(""); setMessage(""); setLoading(true); const body=Object.fromEntries(new FormData(e.currentTarget));
    const res=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}); const data=await res.json().catch(()=>({})); setLoading(false);
    if(!res.ok){setError(data.error||"Có lỗi xảy ra");return;} if(mode==="login"){router.push(data.redirect||"/documents");router.refresh();} else setMessage(data.message||"Kiểm tra email của bạn.");
  }
  return <form onSubmit={submit} className="card" style={{padding:24,maxWidth:440}}><h1 style={{fontSize:28,marginTop:0}}>{mode==="login"?"Đăng nhập":"Đăng ký"}</h1>
    <label className="label">Email</label><input className="input" name="email" type="email" autoComplete="email" required />
    <label className="label" style={{marginTop:14}}>Mật khẩu</label><input className="input" name="password" type="password" autoComplete={mode==="login"?"current-password":"new-password"} minLength={12} required />
    {mode==="login" && <div style={{marginTop:10,fontSize:13}}><a href="/auth/forgot-password" style={{textDecoration:"underline"}}>Quên mật khẩu?</a></div>}
    {error&&<div style={{color:"#b91c1c",background:"#fef2f2",padding:10,borderRadius:10,marginTop:14,fontSize:13}}>{error}</div>}
    {message&&<div style={{color:"#166534",background:"#f0fdf4",padding:10,borderRadius:10,marginTop:14,fontSize:13}}>{message}</div>}
    <button className="btn btn-primary" style={{width:"100%",marginTop:18}} disabled={loading}>{loading?"Đang xử lý…":mode==="login"?"Đăng nhập":"Tạo tài khoản"}</button>
  </form>;
}

export function SimpleResetForm({ resetToken }: { resetToken?: string }) {
  const [error,setError]=useState(""); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setError(""); const body=Object.fromEntries(new FormData(e.currentTarget)); if(resetToken) body.token=resetToken; const res=await fetch("/api/auth/reset-password",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});const d=await res.json().catch(()=>({}));setLoading(false);if(!res.ok){setError(d.error||"Không thể đặt lại mật khẩu");return;}setMessage(d.message||"Đã đổi mật khẩu");}
  return <form onSubmit={submit} className="card" style={{padding:24,maxWidth:440}}><h1 style={{fontSize:28,marginTop:0}}>{resetToken?"Đặt mật khẩu mới":"Quên mật khẩu"}</h1>{!resetToken&&<><label className="label">Email</label><input className="input" name="email" type="email" required /></>}{resetToken&&<><label className="label">Mật khẩu mới</label><input className="input" name="password" type="password" minLength={12} required /></>}{error&&<div style={{color:"#b91c1c",marginTop:12,fontSize:13}}>{error}</div>}{message&&<div style={{color:"#166534",marginTop:12,fontSize:13}}>{message}</div>}<button className="btn btn-primary" style={{width:"100%",marginTop:18}} disabled={loading}>{loading?"Đang xử lý…":resetToken?"Đổi mật khẩu":"Gửi email đặt lại"}</button></form>;
}
