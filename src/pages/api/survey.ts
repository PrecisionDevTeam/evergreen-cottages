import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";

const BOOK_DIRECT_VALUES = new Set(["yes", "maybe", "no"]);
const DISCOUNT_VALUES = new Set(["10_off_3nights", "15_off_5nights", "neither"]);
const GIFT_CARD_TYPES = new Set(["amazon", "starbucks"]);
const WASH_FOLD_PRICES = new Set(["", "$5", "$10", "$15", "$20+"]);

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  if (!checkRate(ip)) {
    return res.status(429).json({ error: "Too many submissions. Please try again later." });
  }

  const {
    name, email, phone, property,
    overall, cleanliness, checkin, value,
    traveledFrom, whatLiked, whatDifferent,
    bookDirect, airportPickup, wouldBuyItems,
    usedLaundry, washFold, washFoldPrice,
    discount, birthday, giftCardEmail, giftCardType,
  } = req.body ?? {};

  const overallRating = clampRating(overall);
  const cleanlinessRating = clampRating(cleanliness);
  const checkinRating = clampRating(checkin);
  const valueRating = clampRating(value);

  if (!name || !email || !overallRating || !cleanlinessRating || !checkinRating || !valueRating) {
    return res.status(400).json({ error: "Name, email, and all ratings are required" });
  }
  if (!traveledFrom?.trim() || !whatLiked?.trim() || !bookDirect || !discount) {
    return res.status(400).json({ error: "Please complete all required questions" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  const giftCardEmailValue = (giftCardEmail || email).toString();
  if (giftCardEmailValue && (!emailRegex.test(giftCardEmailValue) || giftCardEmailValue.length > 254)) {
    return res.status(400).json({ error: "Invalid gift card email" });
  }

  const bookDirectValue = String(bookDirect).toLowerCase();
  if (!BOOK_DIRECT_VALUES.has(bookDirectValue)) {
    return res.status(400).json({ error: "Invalid book direct value" });
  }
  const discountValue = String(discount);
  if (!DISCOUNT_VALUES.has(discountValue)) {
    return res.status(400).json({ error: "Invalid discount preference" });
  }
  const giftCardTypeValue = String(giftCardType || "amazon").toLowerCase();
  if (!GIFT_CARD_TYPES.has(giftCardTypeValue)) {
    return res.status(400).json({ error: "Invalid gift card type" });
  }
  const washFoldPriceValue = String(washFoldPrice || "");
  if (!WASH_FOLD_PRICES.has(washFoldPriceValue)) {
    return res.status(400).json({ error: "Invalid wash & fold price" });
  }

  const birthdayValue = birthday && /^\d{4}-\d{2}-\d{2}$/.test(birthday) ? birthday : null;

  try {
    await prisma.$executeRaw`
      INSERT INTO guest_surveys
        (guest_name, guest_phone, guest_email, property_name,
         overall_rating, cleanliness_rating, checkin_rating, value_rating,
         traveled_from, what_liked, what_different,
         would_book_direct, airport_pickup, would_buy_items,
         used_laundry, would_pay_wash_fold, wash_fold_price,
         preferred_discount, birthday, gift_card_email, gift_card_type)
       VALUES (
         ${String(name).slice(0, 100)},
         ${String(phone || "").slice(0, 20)},
         ${String(email).slice(0, 254)},
         ${String(property || "").slice(0, 100)},
         ${overallRating},
         ${cleanlinessRating},
         ${checkinRating},
         ${valueRating},
         ${String(traveledFrom).slice(0, 200)},
         ${String(whatLiked).slice(0, 1000)},
         ${String(whatDifferent || "").slice(0, 1000)},
         ${bookDirectValue},
         ${Boolean(airportPickup)},
         ${String(wouldBuyItems || "nothing").slice(0, 500)},
         ${Boolean(usedLaundry)},
         ${Boolean(washFold)},
         ${washFoldPriceValue},
         ${discountValue},
         ${birthdayValue ? new Date(birthdayValue) : null},
         ${giftCardEmailValue.slice(0, 254)},
         ${giftCardTypeValue}
       )`;

    // Discord notification
    try {
      const discordWebhook = process.env.DISCORD_SURVEY_WEBHOOK;
      if (discordWebhook) {
        await fetch(discordWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `New Survey Response\n` +
              `Guest: ${String(name).slice(0, 50)}\n` +
              `Unit: ${String(property || "N/A").slice(0, 50)} | From: ${String(traveledFrom).slice(0, 50)}\n` +
              `Overall: ${overallRating}/5 | Cleanliness: ${cleanlinessRating}/5\n` +
              `Book direct: ${bookDirectValue} | Airport pickup: ${airportPickup ? "Yes" : "No"}\n` +
              `Laundry: ${usedLaundry ? "Yes" : "No"} | W&F: ${washFold ? `Yes (${washFoldPriceValue})` : "No"}\n` +
              `Discount: ${discountValue} | Gift card: ${giftCardTypeValue}\n` +
              (whatLiked ? `Liked: "${String(whatLiked).slice(0, 150)}"\n` : "") +
              (whatDifferent ? `Different: "${String(whatDifferent).slice(0, 150)}"` : ""),
          }),
        });
      }
    } catch {
      // Non-critical
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Survey submission error:", err);
    return res.status(500).json({ error: "Failed to save survey" });
  }
}
