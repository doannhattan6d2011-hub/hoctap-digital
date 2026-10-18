import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
export async function GET(request:Request){try{await requireAdmin();const sp=new URL(request.url).searchParams;const limit=Math.min(Number(sp.get("limit")||100),500);const rows=await prisma.download.findMany({take:limit,orderBy:{createdAt:"desc"},include:{user:{select:{email:true}},document:{select:{title:true}}}});return Response.json({downloads:rows});}catch{return Response.json({error:"Không có quyền"},{status:403})}}
