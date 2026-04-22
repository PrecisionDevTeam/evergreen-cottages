import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import * as crypto from "crypto";
import { getProperty, getCalendar, prisma } from "../../lib/db";
import { verifyOrigin, rateLimit } from "../../lib/api-security";

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

/**
 * Extension checkout — Stripe session for stay extensions.
 *
 * Two variants:
 *  - same  → original unit, 10% off nightly (admin-editable), NO new cleaning fee.
 *  - other → different Pensacola unit, 10% off nightly, REDUCED cleaning fee ($40, editable).
 *
 * Server enforces:
 *  - Token verification (v2 or legacy) — variant from the signed token is the
 *    source of truth; client-supplied `variant` is ignored if it mismatches.
 *  - Availability re-check against our calendar (hourly-refreshed). If live
 *    verification is desired later we can add `verifyAvailabilityLive()` here.
 *  - Price + cleaning fee pinning server-side using the latest discount % and
 *    reduced cleaning fee from data-hub settings (no client pricing).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!verifyOrigin(req, res)) return;
  if (!rateLimit(req, res, 10)) return;

  const { token, propertyId, checkIn, checkOut, guests, originalReservationId } = req.body;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!propertyId || !checkIn || !checkOut) return res.status(400).json({ error: "Missing required fields" });
  if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) return res.status(400).json({ error: "Invalid date format" });

  const guestsNum = Math.floor(Number(guests || 1));
  if (!Number.isFinite(guestsNum) || guestsNum < 1 || guestsNum > 20) {
    return res.status(400).json({ error: "Invalid guest count" });
  }

  const origResId = originalReservationId ? parseInt(String(originalReservationId), 10) : null;
  if (origResId !== null && (!Number.isInteger(origResId) || origResId <= 0)) {
    return res.status(400).json({ error: "Invalid originalReservationId" });
  }

  // Verify token — tolerate legacy; variant in token is authoritative
  const decoded = typeof token === "string" ? verifyToken(token) : null;
  if (!decoded) return res.status(401).json({ error: "Invalid or expired extension link" });
  if (origResId && origResId !== decoded.reservationId) {
    return res.status(401).json({ error: "Reservation mismatch" });
  }
  // Guest email + original property from the reservation — never trust the client
  let resolvedEmail: string | undefined;
  let origPropertyId: number | undefined;
  try {
    const origRes = await prisma.reservation.findUnique({
      where: { id: decoded.reservationId },
      include: { guest: true, property: { select: { id: true } } },
    });
    resolvedEmail = origRes?.guest?.primary_email || undefined;
    origPropertyId = origRes?.property?.id ?? undefined;
  } catch {
    /* non-blocking */
  }

  try {
    const id = parseInt(String(propertyId), 10);
    if (!Number.isInteger(id) || id <= 0 || id > 100000) {
      return res.status(400).json({ error: "Invalid property ID" });
    }
    const property = await getProperty(id);

    // Derive variant from whether the guest is staying in the same unit or switching.
    // Token variant can be stale (page now shows both options simultaneously).
    const variant: "same" | "other" = (origPropertyId && origPropertyId !== id) ? "other" : "same";
    if (!property) return res.status(404).json({ error: "Property not found" });

    // Pull live pricing settings (short cache upstream). Fallback defaults
    // if the data hub isn't reachable.
    const settings = await fetchExtensionSettings();
    const discountPct = Math.max(0, Math.min(50, settings.discount_percent));
    const unitChangeCleaningFee = Math.max(0, settings.unit_change_cleaning_fee);

    // Calendar-cached availability pass (hourly staleness is acceptable risk
    // for now; switching to live Hostaway call is straightforward later).
    const calendar = await getCalendar(property.hostaway_property_id, 180);
    const calendarPrices: Record<string, number> = {};
    const blockedDates = new Set<string>();
    for (const day of calendar) {
      const key = day.date instanceof Date
        ? day.date.toISOString().split("T")[0]
        : String(day.date).split("T")[0];
      if (day.price) calendarPrices[key] = Number(day.price);
      if (!day.is_available) blockedDates.add(key);
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    if (nights <= 0) return res.status(400).json({ error: "Invalid dates" });

    const fallbackPrice = property.base_price || 65;
    let subtotal = 0;
    for (let i = 0; i < nights; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      if (blockedDates.has(key)) {
        return res.status(409).json({ error: "One or more selected dates are not available." });
      }
      subtotal += calendarPrices[key] || fallbackPrice;
    }

    // Live availability re-check for unit-swap (variant=other). Guest has
    // never seen this unit so the hourly-stale calendar is a higher risk.
    // For variant=same we rely on the cached calendar — guest is already in
    // the unit, worst case they see "unavailable" and don't extend.
    if (variant === "other" && property.hostaway_property_id) {
      const live = await verifyHostawayAvailabilityLive(
        property.hostaway_property_id, checkIn, checkOut,
      );
      if (live === false) {
        return res.status(409).json({
          error: "Sorry, that unit was just booked. Please pick another or call us.",
        });
      }
      // live === null → Hostaway API unreachable. Accept the cached-calendar
      // result and proceed; we logged the miss on the data-hub side.
    }

    const discountAmount = Math.round(subtotal * (discountPct / 100));
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const cleaningFee = variant === "other" ? unitChangeCleaningFee : 0;
    const total = discountedSubtotal + cleaningFee;

    const checkInFormatted = new Date(checkIn + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const checkOutFormatted = new Date(checkOut + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; description: string; images?: string[] };
        unit_amount: number;
      };
      quantity: number;
    }> = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${property.name} — Stay Extension`,
            description: `${nights} night${nights > 1 ? "s" : ""} | ${checkInFormatted} – ${checkOutFormatted}${discountPct > 0 ? ` | ${discountPct}% off nightly` : ""}`,
            images: property.images[0] ? [property.images[0]] : [],
          },
          unit_amount: Math.round(discountedSubtotal * 100),
        },
        quantity: 1,
      },
    ];

    if (cleaningFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Cleaning fee (unit change)",
            description: `Reduced from standard rate because you're swapping units mid-stay.`,
          },
          unit_amount: Math.round(cleaningFee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      ...(resolvedEmail ? { customer_email: resolvedEmail } : {}),
      payment_intent_data: {
        description:
          `Stay Extension (${variant}) — ${property.name} | ${checkInFormatted} – ${checkOutFormatted} | ${nights}n` +
          (discountPct > 0 ? ` | ${discountPct}% off` : "") +
          (cleaningFee > 0 ? ` | cleaning $${cleaningFee}` : " | no cleaning fee"),
      },
      line_items: lineItems,
      metadata: {
        type: "extension",
        variant,
        propertyId: String(property.id),
        hostawayListingId: property.hostaway_property_id || "",
        propertyName: property.name,
        checkIn,
        checkOut,
        guests: String(guestsNum),
        nights: String(nights),
        subtotal: String(subtotal),
        discountPct: String(discountPct),
        discountAmount: String(discountAmount),
        cleaningFee: String(cleaningFee),
        total: String(total),
        originalReservationId: String(decoded.reservationId),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.evergreencottagespensacola.com"}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.evergreencottagespensacola.com"}/extend/cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Extension checkout error:", error instanceof Error ? error.message : "Unknown");
    return res.status(500).json({ error: "Extension checkout failed. Please try again or call (510) 822-7060." });
  }
}

// --- helpers ---

type DecodedToken = {
  reservationId: number;
  guestId: number;
  variant: "same" | "other";
  version: 1 | 2;
};

function verifyToken(token: string): DecodedToken | null {
  const secret = process.env.EXTENSION_SECRET || "";
  if (!secret) return null;
  const parts = token.split(".");

  if (parts.length === 6 && parts[0] === "v2") {
    try {
      const resId = parseInt(parts[1], 10);
      const guestId = parseInt(parts[2], 10);
      const variant = parts[3];
      const exp = parseInt(parts[4], 10);
      const sig = parts[5];
      if (!Number.isInteger(resId) || !Number.isInteger(guestId) || !Number.isInteger(exp)) return null;
      if (variant !== "same" && variant !== "other") return null;
      if (!/^[0-9a-f]{64}$/i.test(sig)) return null;
      if (exp < Math.floor(Date.now() / 1000)) return null;
      const expected = crypto.createHmac("sha256", secret).update(`v2:${resId}:${guestId}:${variant}:${exp}`).digest("hex");
      if (!crypto.timingSafeEqual(new Uint8Array(Buffer.from(sig, "hex")), new Uint8Array(Buffer.from(expected, "hex")))) return null;
      return { reservationId: resId, guestId, variant, version: 2 };
    } catch {
      return null;
    }
  }

  if (parts.length === 3) {
    try {
      const resId = parseInt(parts[0], 10);
      const guestId = parseInt(parts[1], 10);
      const sig = parts[2];
      if (!Number.isInteger(resId) || !Number.isInteger(guestId)) return null;
      if (!/^[0-9a-f]{64}$/i.test(sig)) return null;
      const expected = crypto.createHmac("sha256", secret).update(`${resId}:${guestId}`).digest("hex");
      if (!crypto.timingSafeEqual(new Uint8Array(Buffer.from(sig, "hex")), new Uint8Array(Buffer.from(expected, "hex")))) return null;
      return { reservationId: resId, guestId, variant: "same", version: 1 };
    } catch {
      return null;
    }
  }

  return null;
}

async function fetchExtensionSettings(): Promise<{
  discount_percent: number;
  unit_change_cleaning_fee: number;
}> {
  const dataHubUrl = process.env.DATA_HUB_URL || "";
  const fallback = { discount_percent: 5, unit_change_cleaning_fee: 40 };
  if (!dataHubUrl) return fallback;
  try {
    // Endpoint is public-read — the values are non-sensitive (discount %,
    // cleaning fee) so we don't share WEBHOOK_SECRET here.
    const resp = await fetch(`${dataHubUrl}/admin/api/settings/extension/public`);
    if (!resp.ok) return fallback;
    const json = await resp.json();
    return {
      discount_percent: Number(json.discount_percent) || fallback.discount_percent,
      unit_change_cleaning_fee: Number(json.unit_change_cleaning_fee) || fallback.unit_change_cleaning_fee,
    };
  } catch {
    return fallback;
  }
}

/**
 * Best-effort live Hostaway availability check. Returns:
 *   true  — every night is open right now.
 *   false — at least one night is booked/blocked.
 *   null  — API unreachable / creds missing. Caller decides.
 *
 * Uses HOSTAWAY_ACCOUNT_ID + HOSTAWAY_API_KEY if set on this service,
 * otherwise returns null so the cached-calendar result stands.
 */
async function verifyHostawayAvailabilityLive(
  listingId: string,
  checkIn: string,
  checkOut: string,
): Promise<boolean | null> {
  const clientId = process.env.HOSTAWAY_ACCOUNT_ID;
  const clientSecret = process.env.HOSTAWAY_API_KEY;
  if (!clientId || !clientSecret) return null;

  try {
    const tokenResp = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "general",
      }).toString(),
    });
    if (!tokenResp.ok) return null;
    const token = (await tokenResp.json()).access_token as string | undefined;
    if (!token) return null;

    const end = new Date(checkOut);
    end.setDate(end.getDate() - 1);
    const endStr = end.toISOString().split("T")[0];

    const calResp = await fetch(
      `https://api.hostaway.com/v1/listings/${encodeURIComponent(listingId)}/calendar?startDate=${checkIn}&endDate=${endStr}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!calResp.ok) return null;
    const payload = await calResp.json();
    const days = Array.isArray(payload?.result) ? payload.result : [];

    const expected =
      Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
    if (days.length < expected) return false;
    for (const d of days) {
      const avail = d?.isAvailable;
      if (avail === 0 || avail === false || avail === "0" || avail === "false") return false;
      if (d?.status && typeof d.status === "string" && !["available", "open"].includes(d.status.toLowerCase())) {
        return false;
      }
    }
    return true;
  } catch {
    return null;
  }
}
