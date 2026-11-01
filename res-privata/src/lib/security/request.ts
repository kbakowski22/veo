import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { env } from "@/lib/env";

export type RequestMeta = { ip: string | null; ipHash: string; userAgent: string | null };

/** IP (do zapisu zgody) i jego skrót (do limitów). */
export async function getRequestMeta(): Promise<RequestMeta> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || null;
  const validIp = ip && /^[0-9a-fA-F:.]{3,45}$/.test(ip) ? ip : null;
  return {
    ip: validIp,
    ipHash: hashKey(validIp ?? "unknown"),
    userAgent: h.get("user-agent")?.slice(0, 512) ?? null,
  };
}

export function hashKey(value: string): string {
  return createHash("sha256").update(`${env.rateLimitSalt}:${value}`).digest("hex").slice(0, 32);
}
