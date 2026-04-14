import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { prisma } from "../../lib/db";

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const HOSTAWAY_API = "https://api.hostaway.com/v1";
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const config = {
  api: { bodyParser: false },
};

async function getHostawayToken(): Promise<string> {
  const resp = await fetch(`${HOSTAWAY_API}/accessTokens`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.HOSTAWAY_ACCOUNT_ID || "",
      client_secret: process.env.HOSTAWAY_API_KEY || "",
      scope: "general",
    }),
  });
  const data = await resp.json();
  if (!data.access_token) throw new Error("Failed to get Hostaway token");
  return data.access_token;
}

async function createHostawayReservation(session: any): Promise<any> {
  const meta = session.metadata || {};
  const customer = session.customer_details || {};

  const listingId = meta.hostawayListingId;
  if (!listingId) throw new Error("No hostawayListingId in metadata");

  // Validate dates from metadata
  if (!DATE_REGEX.test(meta.checkIn) || !DATE_REGEX.test(meta.checkOut)) {
    throw new Error(`Invalid date format: ${meta.checkIn} / ${meta.checkOut}`);
  }

  const token = await getHostawayToken();
  await new Promise((r) => setTimeout(r, 1100));

  const nameParts = (customer.name || "Guest").split(" ");
  const firstName = nameParts[0] || "Guest";
  const lastName = nameParts.slice(1).join(" ") || "Direct";

  const reservationData = {
    listingMapId: parseInt(listingId, 10),
    channelId: 2000,
    source: "direct",
    channelName: "direct",
    status: "new",
    arrivalDate: meta.checkIn,
    departureDate: meta.checkOut,
    adults: parseInt(meta.guests, 10) || 1,
    children: 0,
    guestFirstName: firstName,
    guestLastName: lastName,
    guestEmail: customer.email || "",
    guestPhone: customer.phone || "",
    // Use Stripe's authoritative total, not metadata
    totalPrice: (session.amount_total || 0) / 100,
    isPaid: 1,
    currency: "USD",
    comment: meta.type === "extension"
      ? `Stay extension via evergreencottages.com (extends reservation #${meta.originalReservationId || "?"}). Stripe: ${session.id}`
      : `Direct booking via evergreencottages.com.${meta.occasion ? ` Special occasion: ${meta.occasion}.` : ""} Stripe: ${session.id}`,
  };

  const resp = await fetch(`${HOSTAWAY_API}/reservations`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reservationData),
  });

  const result = await resp.json();
  if (!resp.ok) {
    const hostawayError = result?.message || result?.error || "No error detail";
    throw new Error(`Hostaway create failed: ${resp.status} — ${hostawayError}`);
  }

  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"] as string;
  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: "Missing signature or webhook secret" });
  }

  let event: any;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
  } catch {
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};

    if (session.payment_status === "paid") {
      // Log payment (no PII — only operational data)
      console.log("STRIPE_PAYMENT:", JSON.stringify({
        sessionId: session.id,
        amount: (session.amount_total || 0) / 100,
        propertyName: meta.propertyName || null,
        checkIn: meta.checkIn || null,
        checkOut: meta.checkOut || null,
        type: meta.type || "booking",
        timestamp: new Date().toISOString(),
      }));

      // Notify data hub about service purchases (so Noah gets SMS)
      if (meta.type === "service" && meta.serviceId) {
        const customer = session.customer_details || {};
        const dataHubUrl = process.env.DATA_HUB_URL || "https://hostaway-data-hub-production-ffd2.up.railway.app";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
          await fetch(`${dataHubUrl}/webhooks/service-payment`, {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.WEBHOOK_SECRET || ""}`,
            },
            body: JSON.stringify({
              serviceName: meta.serviceName,
              serviceId: meta.serviceId,
              amount: (session.amount_total || 0) / 100,
              guestName: customer.name || meta.guestName || "Guest",
              guestEmail: customer.email || "",
              guestPhone: customer.phone || "",
              propertyName: meta.propertyName || "",
              unitLabel: meta.unitLabel || "",
              checkInDate: meta.checkInDate || "",
              flightInfo: meta.flightInfo || "",
              quantity: meta.quantity || "1",
              stripeSessionId: session.id,
            }),
          });
          console.log("SERVICE_PAYMENT_NOTIFIED:", meta.serviceName, meta.propertyName);
        } catch (err) {
          console.error("SERVICE_PAYMENT_NOTIFY_FAILED:", err instanceof Error ? err.message : "Unknown");
        } finally {
          clearTimeout(timeoutId);
        }
      }

      // Create Hostaway reservation (only for property bookings)
      if (meta.hostawayListingId && meta.checkIn && meta.checkOut) {
        // Idempotency check — skip if already processed
        try {
          const existing = await prisma.processedStripeEvent.findUnique({
            where: { stripe_session_id: session.id },
          });
          if (existing) {
            console.log("STRIPE_DUPLICATE_SKIPPED:", session.id);
            return res.status(200).json({ received: true });
          }

          // Mark as processing before calling Hostaway
          await prisma.processedStripeEvent.create({
            data: {
              stripe_session_id: session.id,
              event_type: "checkout.session.completed",
            },
          });

          const result = await createHostawayReservation(session);
          console.log("HOSTAWAY_RESERVATION_CREATED:", JSON.stringify({
            hostawayId: result?.result?.id || null,
            propertyName: meta.propertyName,
            checkIn: meta.checkIn,
            checkOut: meta.checkOut,
            timestamp: new Date().toISOString(),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error("HOSTAWAY_RESERVATION_FAILED:", JSON.stringify({
            error: message,
            sessionId: session.id,
            timestamp: new Date().toISOString(),
          }));
        }
      }
    }
  }

  return res.status(200).json({ received: true });
}
