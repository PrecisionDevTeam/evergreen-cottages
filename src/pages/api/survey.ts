import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";

const SEGMENTS = new Set(["a", "b", "c", "past"]);
const BOOK_DIRECT_VALUES = new Set(["yes", "maybe", "no"]);
const RETURN_INTENT_VALUES = new Set(["yes", "maybe", "no"]);
const DISCOUNT_VALUES = new Set(["10_off_3nights", "15_off_5nights", "no_preference"]);
const AIRPORT_VALUES = new Set(["uber_lyft", "rental_car", "friend_family", "didnt_fly", "other"]);
const AIRPORT_COST_VALUES = new Set(["under_20", "20_35", "35_50", "over_50", "dont_remember"]);
const AIRPORT_INTEREST_VALUES = new Set(["yes_definitely", "maybe", "no"]);
const GIFT_CARD_CHOICES = new Set(["amazon_10", "starbucks_10", "stay_credit_20", "free_night"]);
const TOTAL_WINE_VALUES = new Set(["yes", "maybe", "no"]);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tokenRegex = /^[a-zA-Z0-9_-]{16,64}$/;

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

const str = (v: unknown, max = 500): string | null => {
  if (!v || typeof v !== "string") return null;
  const s = v.trim();
  return s.length > 0 ? s.slice(0, max) : null;
};

const inSet = (s: Set<string>, v: unknown): string | null => {
  const x = str(v as string);
  return x && s.has(x) ? x : null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  if (!checkRate(ip)) return res.status(429).json({ error: "Too many submissions. Please try again later." });

  const body = req.body ?? {};

  // --- Token: validate and look up server-side identity ---
  const tokenRaw = str(body.token, 64);
  const token = tokenRaw && tokenRegex.test(tokenRaw) ? tokenRaw : null;
  if (!token) {
    return res.status(400).json({ error: "A valid survey token is required" });
  }

  const tokenRows: any[] = await prisma.$queryRaw`
    SELECT guest_email, guest_name, guest_phone, unit, origin_city,
           segment, review_rating, used_at, expires_at
    FROM survey_tokens WHERE token = ${token} LIMIT 1
  `;
  if (!tokenRows.length) {
    return res.status(404).json({ error: "Invalid survey token" });
  }
  const tokenRow = tokenRows[0];
  if (tokenRow.used_at) {
    return res.status(410).json({ error: "Survey already completed" });
  }
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    return res.status(410).json({ error: "Survey link has expired" });
  }

  // Use server-side identity — prevents gift card redirect via tampered body
  const emailRaw: string = tokenRow.guest_email ?? str(body.email, 254) ?? "";
  const name: string = tokenRow.guest_name ?? str(body.name, 100) ?? "";
  const phone: string = tokenRow.guest_phone ?? str(body.phone, 20) ?? "";
  const property: string = tokenRow.unit ?? str(body.property, 100) ?? "";
  const traveledFrom = tokenRow.origin_city ?? str(body.traveledFrom, 200);

  if (!name || !emailRaw) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  if (!emailRegex.test(emailRaw)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // --- Segment from token (not body) ---
  const segmentRaw = tokenRow.segment as string;
  if (!SEGMENTS.has(segmentRaw)) {
    return res.status(400).json({ error: "Invalid segment in token" });
  }

  // --- Review rating from token ---
  const reviewRating = tokenRow.review_rating ? Number(tokenRow.review_rating) : null;
  const overallRating = reviewRating != null && Number.isFinite(reviewRating)
    ? Math.min(Math.max(1, Math.round(reviewRating)), 5)
    : 0;

  // --- Shared ---
  const stoodOut = str(body.stoodOut, 1000);
  const oneChange = str(body.oneChange, 1000);

  // --- Survey A ---
  const bookDirect = inSet(BOOK_DIRECT_VALUES, body.bookDirect);
  const discountPref = inSet(DISCOUNT_VALUES, body.discountPref);
  const bookDirectReason = str(body.bookDirectReason, 1000);
  const wouldBuyItems = str(body.wouldBuyItems, 500);
  const airportMethod = inSet(AIRPORT_VALUES, body.airportMethod);
  const airportCost = inSet(AIRPORT_COST_VALUES, body.airportCost);
  const airportInterest = inSet(AIRPORT_INTEREST_VALUES, body.airportInterest);
  const usedLaundry = Boolean(body.usedLaundry);
  const washFoldRaw = str(body.washFold, 10);
  const wouldPayWashFold = washFoldRaw === "yes" || washFoldRaw === "maybe";
  const WASH_FOLD_BUCKETS = new Set([25, 35, 45]);
  const washFoldPriceBucket =
    typeof body.washFoldPriceBucket === "number" && WASH_FOLD_BUCKETS.has(body.washFoldPriceBucket)
      ? body.washFoldPriceBucket : null;
  const washFoldPrice = washFoldPriceBucket ? `$${washFoldPriceBucket}` : null;
  const referralCode = str(body.referralCode, 20);

  // Birthday — month + day without year, store as 2000-MM-DD
  const MONTH_MAP: Record<string, string> = {
    January: "01", February: "02", March: "03", April: "04",
    May: "05", June: "06", July: "07", August: "08",
    September: "09", October: "10", November: "11", December: "12",
  };
  const birthdayMonthRaw = str(body.birthdayMonth, 20);
  const birthdayDayRaw = str(body.birthdayDay, 5);
  let birthday: Date | null = null;
  if (birthdayMonthRaw && birthdayDayRaw && MONTH_MAP[birthdayMonthRaw]) {
    const mm = MONTH_MAP[birthdayMonthRaw];
    const dd = String(parseInt(birthdayDayRaw, 10)).padStart(2, "0");
    birthday = new Date(`2000-${mm}-${dd}`);
    if (isNaN(birthday.getTime())) birthday = null;
  }

  // --- Survey B ---
  const fiveStarFix = str(body.fiveStarFix, 1000);
  const bookDirectB = inSet(BOOK_DIRECT_VALUES, body.bookDirectB);

  // --- Past guest ---
  const pastAppreciated = str(body.pastAppreciated, 1000);
  const pastChange = str(body.pastChange, 1000);
  const totalWineInterest = inSet(TOTAL_WINE_VALUES, body.totalWineInterest);
  const pastAirportInterest = inSet(AIRPORT_INTEREST_VALUES, body.pastAirportInterest);

  // Combined: use the segment-appropriate book_direct answer
  const wouldBookDirect = segmentRaw === "a" ? bookDirect : bookDirectB;

  // stoodOut/oneChange → existing columns
  const highlight = segmentRaw === "a" ? stoodOut : segmentRaw === "past" ? pastAppreciated : null;
  const whatLiked = segmentRaw === "b" ? stoodOut : null;
  const whatDifferent = segmentRaw === "past" ? pastChange : oneChange;
  const fiveStarImprovement = segmentRaw === "b" ? fiveStarFix : null;

  // --- New travel + airport questions ---
  const TRAVEL_ORIGIN_VALUES = new Set(["drove", "flew", "other"]);
  const AIRPORT_FUTURE_VALUES = new Set(["yes", "no"]);
  const travelOrigin = inSet(TRAVEL_ORIGIN_VALUES, body.travelOrigin);
  const travelCity = str(body.travelCity, 200);
  const airportFutureInterest = inSet(AIRPORT_FUTURE_VALUES, body.airportFuture);
  const airportPrice = str(body.airportPrice, 100);

  // --- Gift card ---
  const giftCardChoice = inSet(GIFT_CARD_CHOICES, body.giftCardChoice);
  if (!giftCardChoice) {
    return res.status(400).json({ error: "Gift card selection is required" });
  }
  // Segment rules: past gets free_night or $10 cards; A/B get $10 cards or stay_credit_20
  if (giftCardChoice === "free_night" && segmentRaw !== "past") {
    return res.status(400).json({ error: "Invalid gift card selection for this survey" });
  }
  if (giftCardChoice === "stay_credit_20" && segmentRaw === "past") {
    return res.status(400).json({ error: "Invalid gift card selection for this survey" });
  }
  // Enforce global $10 cap of 100 — applies to past segment only (A/B are unlimited)
  if (segmentRaw === "past" && (giftCardChoice === "amazon_10" || giftCardChoice === "starbucks_10")) {
    const capRows: any[] = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS cnt FROM guest_surveys
      WHERE gift_card_choice IN ('amazon_10', 'starbucks_10', 'stay_credit_20')
    `;
    if (Number(capRows[0]?.cnt ?? 0) >= 100) {
      return res.status(400).json({ error: "Gift cards have all been claimed. Please select the free night entry instead." });
    }
  }
  const giftCardType =
    giftCardChoice === "starbucks_10" ? "starbucks"
    : giftCardChoice === "stay_credit_20" ? "stay_credit"
    : giftCardChoice === "free_night" ? "free_night"
    : "amazon";
  const giftCardEmail = emailRaw;

  try {
    await prisma.$executeRaw`
      INSERT INTO guest_surveys (
        guest_name, guest_email, guest_phone, property_name,
        overall_rating, cleanliness_rating,
        traveled_from,
        what_liked, what_different,
        would_book_direct, would_buy_items,
        used_laundry, would_pay_wash_fold, wash_fold_price,
        preferred_discount, birthday,
        gift_card_email, gift_card_type,
        segment, highlight, five_star_improvement,
        token, review_rating,
        wash_fold_price_bucket, gift_card_choice, referral_code,
        airport_method, airport_cost, airport_interest,
        book_direct_reason, five_star_fix,
        total_wine_interest,
        travel_origin, travel_city, airport_future_interest, airport_price
      ) VALUES (
        ${name}, ${emailRaw}, ${phone}, ${property},
        ${overallRating}, ${0},
        ${traveledFrom},
        ${whatLiked}, ${whatDifferent},
        ${wouldBookDirect}, ${wouldBuyItems},
        ${usedLaundry}, ${wouldPayWashFold}, ${washFoldPrice},
        ${discountPref}, ${birthday},
        ${giftCardEmail}, ${giftCardType},
        ${segmentRaw}, ${highlight}, ${fiveStarImprovement},
        ${token}, ${reviewRating},
        ${washFoldPriceBucket}, ${giftCardChoice}, ${referralCode},
        ${airportMethod}, ${airportCost}, ${airportInterest},
        ${bookDirectReason}, ${fiveStarFix},
        ${totalWineInterest},
        ${travelOrigin}, ${travelCity}, ${airportFutureInterest}, ${airportPrice}
      )
      ON CONFLICT (token) DO NOTHING
    `;

    // Mark token as used
    if (token) {
      await prisma.$executeRaw`
        UPDATE survey_tokens SET used_at = NOW() WHERE token = ${token} AND used_at IS NULL
      `.catch(() => null);
    }

    // Discord notification
    try {
      const webhook = process.env.DISCORD_SURVEY_WEBHOOK;
      if (webhook) {
        const segLabel =
          segmentRaw === "a" ? "⭐ Promoter"
          : segmentRaw === "b" ? "🟡 Passive"
          : segmentRaw === "past" ? "🕰️ Past Guest"
          : "🔴 Detractor";
        let details = "";
        if (segmentRaw === "a") {
          details = `Stood out: "${(stoodOut ?? "").slice(0, 100)}"\nOne change: "${(oneChange ?? "").slice(0, 80)}"`;
          if (bookDirect) details += `\nBook direct: ${bookDirect}${discountPref ? ` | Discount pref: ${discountPref}` : ""}`;
        } else if (segmentRaw === "b") {
          details = `Did well: "${(stoodOut ?? "").slice(0, 100)}"\n5★ fix: "${(fiveStarFix ?? "").slice(0, 100)}"`;
          if (bookDirectB) details += `\nBook direct: ${bookDirectB}`;
        } else if (segmentRaw === "past") {
          details = `Appreciated: "${(pastAppreciated ?? "").slice(0, 100)}"\nChange: "${(pastChange ?? "").slice(0, 80)}"`;
          if (totalWineInterest) details += `\nTotal Wine interest: ${totalWineInterest}`;
          if (pastAirportInterest) details += `\nAirport transfer interest: ${pastAirportInterest}`;
        }
        const airportInfo = segmentRaw !== "past" && airportMethod
          ? `Airport: ${airportMethod}${airportInterest ? ` | Transfer interest: ${airportInterest}` : ""}`
          : "";
        const travelInfo = travelOrigin
          ? `Travel: ${travelOrigin}${travelCity ? ` from ${travelCity}` : ""}${airportFutureInterest ? ` | Future pickup: ${airportFutureInterest}${airportPrice ? ` ($${airportPrice})` : ""}` : ""}`
          : "";
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content:
              `📋 **New Survey — ${segLabel}**\n` +
              `Guest: ${name} | Unit: ${property ?? "—"} | Rating: ${reviewRating ?? "—"}/5\n` +
              (details ? `${details}\n` : "") +
              (airportInfo ? `${airportInfo}\n` : "") +
              (travelInfo ? `${travelInfo}\n` : "") +
              `Gift card: ${giftCardChoice} → ${giftCardEmail}`,
          }),
        });
      }
    } catch {
      // Non-critical
    }

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505") {
      return res.status(200).json({ success: true });
    }
    console.error("Survey submission error:", err);
    return res.status(500).json({ error: "Failed to save survey" });
  }
}
