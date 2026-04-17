import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getProperty, getCalendar } from "../../lib/db";
import { verifyOrigin, rateLimit } from "../../lib/api-security";

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

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

    // Check availability + calculate price
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

    const cleaningFee = property.cleaning_fee || 65;
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
        description: `${property.name} | ${checkInFormatted} – ${checkOutFormatted} | ${nights} nights | ${guests} guest${Number(guests) > 1 ? "s" : ""}`,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${property.name} | ${checkInFormatted} – ${checkOutFormatted}`,
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
        propertyName: property.name,
        checkIn,
        checkOut,
        guests: String(guests),
        nights: String(nights),
        subtotal: String(subtotal),
        cleaningFee: String(cleaningFee),
        total: String(total),
        occasion: typeof occasion === "string" ? occasion.slice(0, 50) : "",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com"}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com"}/properties/${property.id}`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: "Checkout failed. Please try again or call (510) 822-7060." });
  }
}
