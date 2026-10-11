import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
export default function RegisterPage(){return <div className="container" style={{padding:"64px 0"}}><AuthForm mode="register"/><p className="muted" style={{fontSize:13}}>Mật khẩu tối thiểu 12 ký tự. <Link href="/auth/login" style={{textDecoration:"underline"}}>Đã có tài khoản?</Link></p></div>}
