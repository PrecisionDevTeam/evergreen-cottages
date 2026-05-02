import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";

type RateBucket = { count: number; reset: number };
const rateBuckets = new Map<string, RateBucket>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

const checkRate = (ip: string) => {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.reset < now) {
    rateBuckets.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= RATE_LIMIT;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  if (!checkRate(ip)) return res.status(429).json({ error: "Too many requests" });

  const { t } = req.query;
  if (!t || typeof t !== "string" || !/^[a-zA-Z0-9_-]{16,64}$/.test(t)) {
    return res.status(400).json({ error: "Invalid token" });
  }

  const rows: any[] = await prisma.$queryRaw`
    SELECT
      token, segment, review_rating,
      guest_name, guest_email, guest_phone,
      unit, check_in, check_out, origin_city,
      referral_code, expires_at, used_at
    FROM survey_tokens
    WHERE token = ${t}
    LIMIT 1
  `;

  if (!rows.length) return res.status(404).json({ error: "Token not found" });

  const row = rows[0];

  if (row.used_at) {
    return res.status(410).json({ error: "Survey already completed" });
  }

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return res.status(410).json({ error: "Survey link has expired" });
  }

  return res.status(200).json({
    segment: row.segment,
    reviewRating: row.review_rating ? Number(row.review_rating) : null,
    guestName: row.guest_name ?? null,
    guestEmail: row.guest_email ?? null,
    guestPhone: row.guest_phone ?? null,
    unit: row.unit ?? null,
    checkIn: row.check_in ? new Date(row.check_in).toISOString().split("T")[0] : null,
    checkOut: row.check_out ? new Date(row.check_out).toISOString().split("T")[0] : null,
    originCity: row.origin_city ?? null,
    referralCode: row.referral_code ?? null,
  });
}
