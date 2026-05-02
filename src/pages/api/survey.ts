import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";

const SEGMENTS = new Set(["a", "b", "c"]);
const RECOMMEND_VALUES = new Set(["yes", "no", "already"]);
const RETURN_INTENT_VALUES = new Set(["yes", "maybe", "no"]);
const DISCOUNT_VALUES = new Set(["10_off_3nights", "15_off_5nights", "neither"]);
const GIFT_CARD_TYPES = new Set(["amazon", "starbucks"]);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clampRating = (n: unknown) => {
  const x = Number(n);
  return Number.isFinite(x) ? Math.min(Math.max(1, Math.round(x)), 5) : null;
};

type RateBucket = { count: number; reset: number };
const rateBuckets = new Map<string, RateBucket>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

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

const validateEmail = (v: unknown): string | null => {
  if (!v || typeof v !== "string") return null;
  const s = v.trim();
  return emailRegex.test(s) && s.length <= 254 ? s : null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  if (!checkRate(ip)) return res.status(429).json({ error: "Too many submissions. Please try again later." });

  const body = req.body ?? {};

  // --- Base fields ---
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 20) : "";
  const property = typeof body.property === "string" ? body.property.trim().slice(0, 100) : "";
  const traveledFrom = typeof body.traveledFrom === "string" ? body.traveledFrom.trim().slice(0, 200) : "";

  if (!name || !emailRaw || !property || !traveledFrom) {
    return res.status(400).json({ error: "Name, email, unit, and where you traveled from are required" });
  }
  if (!emailRegex.test(emailRaw) || emailRaw.length > 254) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const overallRating = clampRating(body.overall);
  const cleanlinessRating = clampRating(body.cleanliness);
  const checkinRating = clampRating(body.checkin);
  const valueRating = clampRating(body.value);
  if (!overallRating || !cleanlinessRating || !checkinRating || !valueRating) {
    return res.status(400).json({ error: "All ratings are required" });
  }

  // --- Segment ---
  const segmentRaw = typeof body.segment === "string" ? body.segment.toLowerCase() : "";
  const segment = SEGMENTS.has(segmentRaw) ? segmentRaw : null;

  // --- Segment A fields ---
  const highlight = segment === "a" && typeof body.highlight === "string"
    ? body.highlight.trim().slice(0, 1000) : null;
  const wouldRecommend = segment === "a" && typeof body.wouldRecommend === "string"
    ? body.wouldRecommend.toLowerCase() : null;
  if (wouldRecommend && !RECOMMEND_VALUES.has(wouldRecommend)) {
    return res.status(400).json({ error: "Invalid recommend value" });
  }
  const referralEmail = segment === "a" ? validateEmail(body.referralEmail) : null;
  const wouldBuyItems = segment === "a" && typeof body.wouldBuyItems === "string"
    ? body.wouldBuyItems.trim().slice(0, 500) : null;

  // --- Segment B fields ---
  const whatLiked = segment === "b" && typeof body.whatLiked === "string"
    ? body.whatLiked.trim().slice(0, 1000) : null;
  const fiveStarImprovement = segment === "b" && typeof body.fiveStarImprovement === "string"
    ? body.fiveStarImprovement.trim().slice(0, 1000) : null;
  const returnIntent = segment === "b" && typeof body.returnIntent === "string"
    ? body.returnIntent.toLowerCase() : null;
  if (returnIntent && !RETURN_INTENT_VALUES.has(returnIntent)) {
    return res.status(400).json({ error: "Invalid return intent value" });
  }
  const preferredDiscount = segment === "b" && typeof body.preferredDiscount === "string"
    ? body.preferredDiscount : null;
  if (preferredDiscount && !DISCOUNT_VALUES.has(preferredDiscount)) {
    return res.status(400).json({ error: "Invalid discount preference" });
  }

  // --- Segment C fields ---
  const complaintCategories = segment === "c" && typeof body.complaintCategories === "string"
    ? body.complaintCategories.slice(0, 500) : null;
  const complaintDetail = segment === "c" && typeof body.complaintDetail === "string"
    ? body.complaintDetail.trim().slice(0, 1000) : null;
  const wantsCallback = segment === "c" ? Boolean(body.wantsCallback) : false;

  // --- Gift card ---
  const giftCardTypeRaw = typeof body.giftCardType === "string" ? body.giftCardType.toLowerCase() : "amazon";
  const giftCardType = GIFT_CARD_TYPES.has(giftCardTypeRaw) ? giftCardTypeRaw : "amazon";
  const giftCardEmail = validateEmail(body.giftCardEmail) ?? emailRaw;

  try {
    await prisma.$executeRaw`
      INSERT INTO guest_surveys (
        guest_name, guest_phone, guest_email, property_name,
        overall_rating, cleanliness_rating, checkin_rating, value_rating,
        traveled_from,
        segment,
        highlight, would_recommend, referral_email, would_buy_items,
        what_liked, five_star_improvement, return_intent, preferred_discount,
        complaint_categories, complaint_detail, wants_callback,
        gift_card_email, gift_card_type
      ) VALUES (
        ${name}, ${phone}, ${emailRaw}, ${property},
        ${overallRating}, ${cleanlinessRating}, ${checkinRating}, ${valueRating},
        ${traveledFrom},
        ${segment},
        ${highlight}, ${wouldRecommend}, ${referralEmail}, ${wouldBuyItems},
        ${whatLiked}, ${fiveStarImprovement}, ${returnIntent}, ${preferredDiscount},
        ${complaintCategories}, ${complaintDetail}, ${wantsCallback},
        ${giftCardEmail}, ${giftCardType}
      )
      ON CONFLICT (guest_email, property_name, (created_at::date)) DO NOTHING
    `;

    // Discord notification
    try {
      const webhook = process.env.DISCORD_SURVEY_WEBHOOK;
      if (webhook) {
        const segLabel = segment === "a" ? "⭐ Promoter" : segment === "b" ? "🟡 Passive" : segment === "c" ? "🔴 Detractor" : "—";
        let segDetails = "";
        if (segment === "a") {
          segDetails = `Highlight: "${(highlight ?? "").slice(0, 100)}"\nRecommend: ${wouldRecommend}${referralEmail ? ` | Referral: ${referralEmail}` : ""}`;
        } else if (segment === "b") {
          segDetails = `Did well: "${(whatLiked ?? "").slice(0, 100)}"\n5★ fix: "${(fiveStarImprovement ?? "").slice(0, 100)}"\nReturn: ${returnIntent}`;
        } else if (segment === "c") {
          segDetails = `Issues: ${(complaintCategories ?? "").slice(0, 150)}\nDetail: "${(complaintDetail ?? "").slice(0, 100)}"\nCallback: ${wantsCallback ? "Yes" : "No"}`;
        }
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content:
              `📋 **New Survey — ${segLabel}**\n` +
              `Guest: ${name} | Unit: ${property} | From: ${traveledFrom}\n` +
              `Overall: ${overallRating}/5 | Clean: ${cleanlinessRating}/5 | Check-in: ${checkinRating}/5\n` +
              (segDetails ? `${segDetails}\n` : "") +
              `Gift card: ${giftCardType} → ${giftCardEmail}`,
          }),
        });
      }
    } catch {
      // Non-critical
    }

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    // Unique constraint violation = duplicate submission — treat as success so guest isn't confused
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505") {
      return res.status(200).json({ success: true });
    }
    console.error("Survey submission error:", err);
    return res.status(500).json({ error: "Failed to save survey" });
  }
}
