import { destroySession } from "@/lib/auth";
import { sameOrigin } from "@/lib/http";
import { redirect } from "next/navigation";
export async function POST(request: Request) { if (!sameOrigin(request)) return new Response("Invalid origin", { status: 403 }); await destroySession(); redirect("/"); }
