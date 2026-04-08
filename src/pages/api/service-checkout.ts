import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
  apiVersion: "2022-11-15",
});

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

  const { serviceId, guestName, propertyName, quantity: rawQty } = req.body;
  const quantity = Math.min(Math.max(1, Math.floor(Number(rawQty) || 1)), 10);

  const service = SERVICES[serviceId];
  if (!service) {
    return res.status(400).json({ error: "Invalid service" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
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
        serviceId,
        serviceName: service.name,
        guestName: guestName || "Guest",
        propertyName: propertyName || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com"}/booking/service-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com"}/services`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: "Checkout failed. Please try again or call (510) 822-7060." });
  }
}
