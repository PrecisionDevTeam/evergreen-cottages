import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { prisma } from "../../lib/db";
import { rentalListing } from "../../lib/rental-catalog";
import { verifyOrigin, rateLimit, safeString } from "../../lib/api-security";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  if (!verifyOrigin(req, res) || !rateLimit(req, res, 5)) return;
  const b = req.body || {};
  if (b.company) return res.status(200).json({ ok: true });
  const id = Number(b.property_id),
    name = safeString(b.name, 160),
    email = safeString(b.email, 254).toLowerCase(),
    message = safeString(b.message, 4000),
    term = safeString(b.rental_term, 10);
  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    !name ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !message
  )
    return res
      .status(400)
      .json({ error: "Enter your name, email and stay details" });
  try {
    const listing = await rentalListing(id);
    if (!listing || !listing.rental_terms.includes(term))
      return res
        .status(400)
        .json({ error: "This rental option is unavailable" });
    await prisma.$executeRaw`INSERT INTO rental_inquiries (id,property_id,name,email,rental_term,message,status,created_at) VALUES (${randomUUID()},${id},${name},${email},${term},${message},'new',NOW())`;
    return res.status(201).json({ ok: true });
  } catch {
    return res
      .status(503)
      .json({
        error:
          "We couldn't save your inquiry. Please email hello@staywithprecision.com.",
      });
  }
}
