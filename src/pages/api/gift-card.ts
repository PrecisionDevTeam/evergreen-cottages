import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
  apiVersion: "2022-11-15",
});

const GIFT_AMOUNTS = [50, 100, 150, 200, 250, 500];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, senderName, recipientName, message } = req.body;

  if (!amount || !GIFT_AMOUNTS.includes(Number(amount))) {
    return res.status(400).json({ error: "Invalid gift card amount" });
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
              name: `Evergreen Cottages Gift Card — $${amount}`,
              description: recipientName
                ? `Gift for ${recipientName}${message ? `: "${message}"` : ""}`
                : "A stay at Evergreen Cottages in Pensacola, FL",
            },
            unit_amount: Number(amount) * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "gift_card",
        amount: String(amount),
        senderName: senderName || "Anonymous",
        recipientName: recipientName || "",
        message: message || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com"}/booking/gift-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://evergreencottages.com"}/gift-cards`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: "Checkout failed. Please try again or call (510) 822-7060." });
  }
}
