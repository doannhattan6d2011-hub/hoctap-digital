import crypto from "node:crypto";

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(`${token}:${process.env.APP_SECRET ?? ""}`).digest("hex");
}

export function timingSafeEqualString(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export function getClientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || null;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
