import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Disable body parsing — Stripe needs the raw body for signature verification
export const config = {
  api: { bodyParser: false },
};

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
      const logEntry = {
        event: "payment_completed",
        sessionId: session.id,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency,
        customerEmail: session.customer_details?.email || null,
        propertyId: meta.propertyId || null,
        propertyName: meta.propertyName || null,
        checkIn: meta.checkIn || null,
        checkOut: meta.checkOut || null,
        guests: meta.guests || null,
        nights: meta.nights || null,
        type: meta.type || "booking",
        serviceName: meta.serviceName || null,
        timestamp: new Date().toISOString(),
      };
      // Railway captures stdout logs
      console.log("STRIPE_PAYMENT:", JSON.stringify(logEntry));
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    console.log("STRIPE_EXPIRED:", JSON.stringify({
      sessionId: session.id,
      propertyName: session.metadata?.propertyName || null,
      timestamp: new Date().toISOString(),
    }));
  }

  // Always return 200 to acknowledge receipt
  return res.status(200).json({ received: true });
}
