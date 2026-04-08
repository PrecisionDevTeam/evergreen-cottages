import { NextApiRequest, NextApiResponse } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com";
const ALLOWED_ORIGINS = [BASE_URL, "https://evergreencottages.com", "http://localhost:3000"];

/**
 * Verify the request origin matches our domain (CSRF protection).
 * Returns true if valid, false if blocked.
 */
export function verifyOrigin(req: NextApiRequest, res: NextApiResponse): boolean {
  const origin = req.headers.origin || req.headers.referer || "";
  const isAllowed = ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
  if (!isAllowed) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

/**
 * Simple in-memory rate limiter per IP.
 * Returns true if allowed, false if rate limited.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;

export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  maxRequests: number = 10
): boolean {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return false;
  }
  return true;
}

/**
 * Sanitize a free-text string for Stripe metadata.
 */
export function safeString(val: unknown, maxLength: number = 100): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLength);
}
