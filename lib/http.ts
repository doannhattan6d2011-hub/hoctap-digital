export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const allowed = process.env.APP_URL || new URL(request.url).origin;
  return origin === allowed;
}
