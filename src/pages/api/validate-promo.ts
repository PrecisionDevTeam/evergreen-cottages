import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { verifyOrigin, rateLimit } from "../../lib/api-security";

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!verifyOrigin(req, res)) return;
  if (!rateLimit(req, res, 20)) return;

  const { code } = req.body;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing promo code" });
  }

  try {
    // Look up promotion code in Stripe
    const promoCodes = await stripe.promotionCodes.list({
      code: code.toUpperCase().trim(),
      active: true,
      limit: 1,
    });

    if (promoCodes.data.length === 0) {
      return res.status(200).json({ valid: false, error: "Invalid or expired promo code" });
    }

    const promo = promoCodes.data[0];
    const coupon = promo.coupon;

    return res.status(200).json({
      valid: true,
      promoId: promo.id,
      discount: coupon.percent_off
        ? { type: "percent", value: coupon.percent_off }
        : { type: "amount", value: (coupon.amount_off || 0) / 100 },
      name: coupon.name || code.toUpperCase(),
    });
  } catch (error) {
    return res.status(200).json({ valid: false, error: "Could not validate code" });
  }
}
