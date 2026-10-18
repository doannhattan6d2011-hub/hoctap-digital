import { z } from "zod";

export const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE_MB || "50") * 1024 * 1024;
export const allowedExtensions = [".ppt", ".pptx"] as const;

export function extensionOf(name: string) {
  const lower = name.toLowerCase();
  const idx = lower.lastIndexOf(".");
  return idx >= 0 ? lower.slice(idx) : "";
}

export function isAllowedFile(name: string, size: number) {
  const ext = extensionOf(name);
  return (ext === ".ppt" || ext === ".pptx") && size > 0 && size <= MAX_FILE_SIZE;
}

export function looksLikeOfficeFile(ext: string, bytes: Buffer) {
  if (ext === ".ppt") return bytes.subarray(0, 8).equals(Buffer.from("D0CF11E0A1B11AE1", "hex"));
  if (ext === ".pptx") return bytes.subarray(0, 4).equals(Buffer.from("504B0304", "hex"));
  return false;
}

export const registerSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(12).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(128),
});

export const documentSchema = z.object({
  title: z.string().trim().min(2).max(200),
  subject: z.string().trim().min(1).max(80),
  grade: z.string().trim().min(1).max(40),
  chapter: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
  originalName: z.string().trim().min(1).max(255),
  storageKey: z.string().min(10).max(500),
  mimeType: z.string().max(120),
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE),
});
