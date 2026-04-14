import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getProperty, getCalendar, prisma } from "../../lib/db";
import { verifyOrigin, rateLimit } from "../../lib/api-security";

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

/**
 * Extension checkout — creates a Stripe session for stay extensions.
 *
 * Differences from regular checkout:
 * - No cleaning fee (guest already paid on original booking)
 * - metadata.type = "extension" (webhook handles differently)
 * - metadata.originalReservationId links to original booking
 * - Guest email resolved server-side from original reservation (not from client)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!verifyOrigin(req, res)) return;
  if (!rateLimit(req, res, 10)) return;

  const { propertyId, checkIn, checkOut, guests, originalReservationId } = req.body;

  // Input validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!propertyId || !checkIn || !checkOut) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
    return res.status(400).json({ error: "Invalid date format" });
  }
  const guestsNum = Math.floor(Number(guests || 1));
  if (!Number.isFinite(guestsNum) || guestsNum < 1 || guestsNum > 20) {
    return res.status(400).json({ error: "Invalid guest count" });
  }

  // Validate originalReservationId
  const origResId = originalReservationId ? parseInt(String(originalReservationId), 10) : null;
  if (origResId !== null && (!Number.isInteger(origResId) || origResId <= 0)) {
    return res.status(400).json({ error: "Invalid originalReservationId" });
  }

  // Resolve guest email server-side (never trust client-supplied email)
  let resolvedEmail: string | undefined;
  if (origResId) {
    try {
      const origRes = await prisma.reservation.findUnique({
        where: { id: origResId },
        include: { guest: true },
      });
      resolvedEmail = origRes?.guest?.primary_email || undefined;
    } catch {
      // Non-blocking — Stripe will collect email if not pre-filled
    }
  }

  try {
    const id = parseInt(String(propertyId), 10);
    if (!Number.isInteger(id) || id <= 0 || id > 100000) {
      return res.status(400).json({ error: "Invalid property ID" });
    }
    const property = await getProperty(id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Fetch calendar for pricing + availability
    const calendar = await getCalendar(property.hostaway_property_id, 180);
    const calendarPrices: Record<string, number> = {};
    const blockedDates = new Set<string>();
    for (const day of calendar) {
      const key = String(day.date).split("T")[0];
      if (day.price) calendarPrices[key] = Number(day.price);
      if (!day.is_available) blockedDates.add(key);
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    if (nights <= 0) {
      return res.status(400).json({ error: "Invalid dates" });
    }

    // Check availability + calculate price (no cleaning fee)
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

    // NO cleaning fee for extensions
    const total = subtotal;

    const checkInFormatted = new Date(checkIn + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const checkOutFormatted = new Date(checkOut + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      // Pre-fill guest email resolved server-side from original reservation
      ...(resolvedEmail ? { customer_email: resolvedEmail } : {}),
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${property.name} — Stay Extension`,
              description: `${nights} extra night${nights > 1 ? "s" : ""} | ${checkInFormatted} – ${checkOutFormatted}`,
              images: property.images[0] ? [property.images[0]] : [],
            },
            unit_amount: Math.round(subtotal * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "extension",
        propertyId: String(property.id),
        hostawayListingId: property.hostaway_property_id || "",
        propertyName: property.name,
        checkIn,
        checkOut,
        guests: String(guestsNum),
        nights: String(nights),
        subtotal: String(subtotal),
        cleaningFee: "0",
        total: String(total),
        originalReservationId: origResId ? String(origResId) : "",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com"}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com"}/extend/cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Extension checkout error:", error);
    return res.status(500).json({ error: "Extension checkout failed. Please try again or call (510) 822-7060." });
  }
}
