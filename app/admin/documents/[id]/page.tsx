import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminEdit from "@/components/AdminEdit";
export default async function EditDocument({params}:{params:Promise<{id:string}>}){const{id}=await params;const doc=await prisma.document.findUnique({where:{id}});if(!doc)notFound();return <div><h1 style={{fontSize:36,marginTop:0}}>Sửa học liệu</h1><AdminEdit doc={doc}/></div>}
