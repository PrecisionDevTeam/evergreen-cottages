import { NextApiRequest, NextApiResponse } from "next";
import { verifyOrigin, rateLimit } from "../../lib/api-security";
import { searchAvailability } from "../../lib/db";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Validate a YYYY-MM-DD string is a real calendar date.
function isValidDate(s: unknown): s is string {
  if (typeof s !== "string" || !DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00.000Z`);
  return !isNaN(d.getTime()) && d.toISOString().split("T")[0] === s;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!verifyOrigin(req, res)) return;
  if (!rateLimit(req, res, 30)) return;

  const { checkIn, checkOut, guests } = req.body || {};

  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    return res.status(400).json({ error: "Invalid dates" });
  }

  const start = new Date(`${checkIn}T00:00:00.000Z`);
  const end = new Date(`${checkOut}T00:00:00.000Z`);
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (nights <= 0) {
    return res.status(400).json({ error: "Check-out must be after check-in" });
  }
  if (nights > 60) {
    return res.status(400).json({ error: "Stay is too long" });
  }

  // Don't allow searching fully in the past.
  const todayKey = new Date().toISOString().split("T")[0];
  if (checkOut < todayKey) {
    return res.status(400).json({ error: "Dates are in the past" });
  }

  const minGuests = Math.min(Math.max(parseInt(String(guests), 10) || 1, 1), 20);

  try {
    const { results } = await searchAvailability(checkIn, checkOut, minGuests);
    const available = results.filter((r) => r.available);
    return res.status(200).json({
      checkIn,
      checkOut,
      nights,
      guests: minGuests,
      consideredCount: results.length,
      availableCount: available.length,
      results: available,
    });
  } catch (err) {
    return res.status(500).json({ error: "Could not check availability" });
  }
}
