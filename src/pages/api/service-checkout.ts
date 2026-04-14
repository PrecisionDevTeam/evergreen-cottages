import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "../../lib/db";
import { verifyOrigin, rateLimit, safeString } from "../../lib/api-security";

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

const SERVICES: Record<string, { name: string; amount: number; description: string }> = {
  "airport-pickup": { name: "Airport Pickup", amount: 2500, description: "One-way airport pickup from Pensacola International Airport" },
  "airport-dropoff": { name: "Airport Drop-off", amount: 2500, description: "One-way airport drop-off to Pensacola International Airport" },
  "early-checkin-standard": { name: "Early Check-in (1 PM)", amount: 2500, description: "Standard early check-in at 1:00 PM" },
  "early-checkin-super": { name: "Super Early Check-in (7 AM)", amount: 4000, description: "Super early check-in at 7:00 AM" },
  "pet-fee": { name: "Pet Fee", amount: 5000, description: "$50 per pet per stay" },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!verifyOrigin(req, res)) return;
  if (!rateLimit(req, res, 10)) return;

  const { serviceId, quantity: rawQty } = req.body;
  const guestName = safeString(req.body.guestName) || "Guest";
  const propertyName = safeString(req.body.propertyName);
  const unitLabel = safeString(req.body.unitLabel) || "";
  const checkInDate = safeString(req.body.checkInDate) || "";
  const flightInfo = safeString(req.body.flightInfo) || "";
  const quantity = Math.min(Math.max(1, Math.floor(Number(rawQty) || 1)), 10);

  const service = SERVICES[serviceId];
  if (!service) {
    return res.status(400).json({ error: "Invalid service" });
  }

  try {
    // Resolve guest email server-side from current reservation for this property
    let resolvedEmail: string | undefined;
    if (propertyName) {
      try {
        const property = await prisma.property.findFirst({
          where: { name: { contains: propertyName } },
        });
        if (property) {
          const reservation = await prisma.reservation.findFirst({
            where: {
              property_id: property.id,
              status: { notIn: ["cancelled", "canceled", "declined", "inquiry"] },
              check_in: { lte: new Date() },
              check_out: { gte: new Date() },
            },
            include: { guest: true },
            orderBy: { check_in: "desc" },
          });
          resolvedEmail = reservation?.guest?.primary_email || undefined;
        }
      } catch {
        // Non-blocking — Stripe will collect email if not resolved
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      ...(resolvedEmail ? { customer_email: resolvedEmail } : {}),
      phone_number_collection: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: service.name,
              description: service.description,
            },
            unit_amount: service.amount,
          },
          quantity,
        },
      ],
      metadata: {
        type: "service",
        serviceId,
        serviceName: service.name,
        guestName: guestName || "Guest",
        propertyName: propertyName || "",
        unitLabel: unitLabel || "",
        checkInDate: checkInDate || "",
        flightInfo: flightInfo || "",
        quantity: String(quantity),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com"}/booking/service-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com"}/services`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: "Checkout failed. Please try again or call (510) 822-7060." });
  }
}
