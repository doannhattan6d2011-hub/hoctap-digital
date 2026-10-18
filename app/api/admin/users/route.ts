import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
export async function GET(){try{await requireAdmin();const users=await prisma.user.findMany({select:{id:true,email:true,role:true,isActive:true,emailVerifiedAt:true,createdAt:true},orderBy:{createdAt:"desc"}});return Response.json({users});}catch{return Response.json({error:"Không có quyền"},{status:403})}}
