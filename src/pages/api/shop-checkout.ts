import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "../../lib/db";
import { verifyOrigin, rateLimit, safeString } from "../../lib/api-security";
import { getItemById, SERVICE_FEE_CENTS, CATALOG } from "../../lib/shop-catalog";

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!verifyOrigin(req, res)) return;
  if (!rateLimit(req, res, 10)) return;

  const { items: rawItems, deliveryPref: rawDeliveryPref } = req.body;
  const guestName = safeString(req.body.guestName) || "Guest";
  const propertyName = safeString(req.body.propertyName);
  const unitLabel = safeString(req.body.unitLabel) || "";
  const deliveryPref = safeString(rawDeliveryPref) || "asap";
  const scheduledTime = safeString(req.body.scheduledTime) || "";

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  if (rawItems.length > CATALOG.length) {
    return res.status(400).json({ error: "Too many items" });
  }

  // Check for duplicate item IDs
  const seenIds = new Set<string>();
  for (const raw of rawItems) {
    const id = typeof raw.itemId === "string" ? raw.itemId : "";
    if (seenIds.has(id)) {
      return res.status(400).json({ error: "Duplicate item in cart" });
    }
    seenIds.add(id);
  }

  // Validate and build line items
  const lineItems: any[] = [];
  const orderItems: Array<{ itemId: string; name: string; quantity: number; priceInCents: number }> = [];
  const compactItems: string[] = [];
  let subtotal = 0;

  for (const raw of rawItems) {
    const itemId = typeof raw.itemId === "string" ? raw.itemId : "";
    const qty = Math.min(Math.max(1, Math.floor(Number(raw.quantity) || 1)), 10);

    const catalogItem = getItemById(itemId);
    if (!catalogItem) {
      return res.status(400).json({ error: `Invalid item: ${itemId}` });
    }

    if (qty > catalogItem.maxQuantity) {
      return res.status(400).json({ error: `Max ${catalogItem.maxQuantity} of ${catalogItem.name}` });
    }

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${catalogItem.name} (${catalogItem.size})`.slice(0, 250),
          description: catalogItem.description.slice(0, 250),
        },
        unit_amount: catalogItem.priceInCents,
      },
      quantity: qty,
    });

    orderItems.push({
      itemId: catalogItem.id,
      name: catalogItem.name,
      quantity: qty,
      priceInCents: catalogItem.priceInCents,
    });

    compactItems.push(`${catalogItem.id}:${qty}`);
    subtotal += catalogItem.priceInCents * qty;
  }

  // Add service fee as separate line item
  lineItems.push({
    price_data: {
      currency: "usd",
      product_data: {
        name: "Service & Delivery Fee",
        description: "Order facilitation and delivery service",
      },
      unit_amount: SERVICE_FEE_CENTS,
    },
    quantity: 1,
  });

  const totalCents = subtotal + SERVICE_FEE_CENTS;

  // Try to resolve guest email from current reservation
  let resolvedEmail: string | undefined;
  if (propertyName && propertyName.length >= 5) {
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
      // Non-blocking
    }
  }

  try {
    const deliveryLabel = deliveryPref === "scheduled" && scheduledTime
      ? `Scheduled: ${scheduledTime}`
      : deliveryPref === "shipped" ? "Shipped" : "ASAP (under 2 hours)";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      ...(resolvedEmail ? { customer_email: resolvedEmail } : {}),
      phone_number_collection: { enabled: true },
      payment_intent_data: {
        description: `Drinks Order — ${guestName}${propertyName ? ` at ${propertyName}` : ""}${unitLabel ? ` Unit ${unitLabel}` : ""} — ${deliveryLabel}`,
      },
      line_items: lineItems,
      metadata: {
        type: "shop",
        guestName,
        propertyName: propertyName || "",
        unitLabel: unitLabel || "",
        deliveryPref: deliveryLabel,
        items: compactItems.join(",").slice(0, 500),
        itemCount: String(orderItems.length),
        subtotalCents: String(subtotal),
        serviceFeeCents: String(SERVICE_FEE_CENTS),
        totalCents: String(totalCents),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.evergreencottagespensacola.com"}/booking/shop-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.evergreencottagespensacola.com"}/shop`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: "Checkout failed. Please try again or call (510) 822-7060." });
  }
}
