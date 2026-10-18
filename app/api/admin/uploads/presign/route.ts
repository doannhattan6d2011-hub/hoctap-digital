import { requireAdmin } from "@/lib/auth";
import { createUploadUrl } from "@/lib/storage";
import { extensionOf, isAllowedFile, MAX_FILE_SIZE } from "@/lib/validation";
import { jsonError, sameOrigin } from "@/lib/http";
import { randomToken } from "@/lib/security";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Invalid origin",403);
  try {
    await requireAdmin();
    const body = await request.json(); const name = String(body.name || ""); const size = Number(body.size); const type = String(body.type || "application/octet-stream");
    if (!isAllowedFile(name,size)) return jsonError(`Chỉ nhận .ppt/.pptx và tối đa ${MAX_FILE_SIZE/1024/1024} MB`);
    const ext = extensionOf(name);
    const safe = `${Date.now()}-${randomToken(10)}${ext}`;
    const key = `documents/${safe}`;
    const uploadUrl = await createUploadUrl(key,type);
    return Response.json({uploadUrl,key});
  } catch(e) { const m=e instanceof Error?e.message:""; return jsonError(m==="FORBIDDEN"||m==="UNAUTHORIZED"?"Không có quyền": "Không thể tạo URL upload", m==="FORBIDDEN"||m==="UNAUTHORIZED"?403:500); }
}
