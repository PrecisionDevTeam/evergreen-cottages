import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getProperty, getCalendar, prisma } from "../../lib/db";
import { verifyOrigin, rateLimit } from "../../lib/api-security";

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

function formatDateLabel(dateStr: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!verifyOrigin(req, res)) return;
  if (!rateLimit(req, res, 10)) return;

  const { propertyId, checkIn, checkOut, guests, promoId, occasion } = req.body;

  // Input validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!propertyId || !checkIn || !checkOut || !guests) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
    return res.status(400).json({ error: "Invalid date format" });
  }
  const guestsNum = Math.floor(Number(guests));
  if (!Number.isFinite(guestsNum) || guestsNum < 1 || guestsNum > 20) {
    return res.status(400).json({ error: "Invalid guest count" });
  }

  try {
    const id = parseInt(String(propertyId), 10);
    if (!Number.isInteger(id) || id <= 0 || id > 100000) {
      return res.status(400).json({ error: "Invalid property ID" });
    }
    const [property, websiteOverride] = await Promise.all([
      getProperty(id),
      prisma.websitePropertyOverride.findFirst({ where: { property_id: id } }),
    ]);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Reject dates beyond our calendar window so we never silently bypass a restriction
    const CALENDAR_WINDOW_DAYS = 365;
    const maxAllowed = new Date();
    maxAllowed.setDate(maxAllowed.getDate() + CALENDAR_WINDOW_DAYS);
    if (new Date(checkOut) > maxAllowed) {
      return res.status(400).json({
        error: `We can only accept bookings up to ${CALENDAR_WINDOW_DAYS} days out. Please contact us for longer stays.`,
      });
    }

    // Fetch calendar for pricing + availability + stay rules
    const calendar = await getCalendar(property.hostaway_property_id, CALENDAR_WINDOW_DAYS);
    const calendarPrices: Record<string, number> = {};
    const blockedDates = new Set<string>();
    const minNightsByDate: Record<string, number> = {};
    const maxNightsByDate: Record<string, number> = {};
    const closedArrival = new Set<string>();
    const closedDeparture = new Set<string>();
    for (const day of calendar) {
      const key = day.date instanceof Date
        ? day.date.toISOString().split("T")[0]
        : String(day.date).split("T")[0];
      if (day.price) calendarPrices[key] = Number(day.price);
      if (!day.is_available) blockedDates.add(key);
      if (day.min_nights && day.min_nights > 0) minNightsByDate[key] = day.min_nights;
      if (day.max_nights && day.max_nights > 0) maxNightsByDate[key] = day.max_nights;
      if (day.closed_on_arrival) closedArrival.add(key);
      if (day.closed_on_departure) closedDeparture.add(key);
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    if (nights <= 0) {
      return res.status(400).json({ error: "Invalid dates" });
    }

    // Closed-on-arrival / closed-on-departure gates
    if (closedArrival.has(checkIn)) {
      return res.status(409).json({
        error: `Check-in is not allowed on ${formatDateLabel(checkIn)}. Please pick another arrival date.`,
      });
    }
    if (closedDeparture.has(checkOut)) {
      return res.status(409).json({
        error: `Check-out is not allowed on ${formatDateLabel(checkOut)}. Please pick another departure date.`,
      });
    }

    // Minimum-night gate (based on check-in day's rule)
    const minNightsRequired = minNightsByDate[checkIn] || 0;
    if (minNightsRequired && nights < minNightsRequired) {
      return res.status(409).json({
        error: `This property requires a ${minNightsRequired}-night minimum for your selected dates. You selected ${nights} night${nights === 1 ? "" : "s"}.`,
      });
    }

    // Maximum-night gate (based on check-in day's rule)
    const maxNightsAllowed = maxNightsByDate[checkIn] || 0;
    if (maxNightsAllowed && nights > maxNightsAllowed) {
      return res.status(409).json({
        error: `This property has a ${maxNightsAllowed}-night maximum for your selected dates. You selected ${nights} night${nights === 1 ? "" : "s"}.`,
      });
    }

    // Calendar convention: entry date = checkout date for that night (Apr 27 = night Apr 26→27).
    // Loop i=1..nights so keys run checkIn+1..checkOut inclusive.
    const fallbackPrice = property.base_price || 65;
    let subtotal = 0;
    for (let i = 1; i <= nights; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      if (blockedDates.has(key)) {
        return res.status(409).json({ error: "One or more selected dates are not available." });
      }
      subtotal += calendarPrices[key] || fallbackPrice;
    }

    const cleaningFee = 65;
    const total = subtotal + cleaningFee;

    const checkInFormatted = new Date(checkIn + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const checkOutFormatted = new Date(checkOut + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      ...(promoId ? { discounts: [{ promotion_code: promoId }] } : { allow_promotion_codes: true }),
      // Collect guest info for Hostaway reservation creation
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      payment_intent_data: {
        description: `${websiteOverride?.website_name || property.name} | ${checkInFormatted} – ${checkOutFormatted} | ${nights} nights | ${guests} guest${Number(guests) > 1 ? "s" : ""}`,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${websiteOverride?.website_name || property.name} | ${checkInFormatted} – ${checkOutFormatted}`,
              description: `${nights} night${nights > 1 ? "s" : ""} | ${guests} guest${guests > 1 ? "s" : ""} | Direct booking`,
              images: property.images[0] ? [property.images[0]] : [],
            },
            unit_amount: Math.round(subtotal * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Cleaning Fee",
            },
            unit_amount: Math.round(cleaningFee * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        propertyId: String(property.id),
        hostawayListingId: property.hostaway_property_id || "",
        propertyName: websiteOverride?.website_name || property.name,
        checkIn,
        checkOut,
        guests: String(guests),
        nights: String(nights),
        subtotal: String(subtotal),
        cleaningFee: String(cleaningFee),
        total: String(total),
        occasion: typeof occasion === "string" ? occasion.slice(0, 50) : "",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.evergreencottagespensacola.com"}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.evergreencottagespensacola.com"}/properties/${property.id}`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: "Checkout failed. Please try again or call (510) 822-7060." });
  }
}
