import UserManager from "@/components/UserManager";
import { prisma } from "@/lib/prisma";
export default async function Users(){const users=await prisma.user.findMany({select:{id:true,email:true,role:true,isActive:true,emailVerifiedAt:true,createdAt:true},orderBy:{createdAt:"desc"}});return <div><h1 style={{fontSize:36,marginTop:0}}>Quản lý người dùng</h1><UserManager users={users}/></div>}
