import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expectedKey = process.env.ADMIN_EXPORT_KEY;
  if (!expectedKey) {
    return res.status(500).json({ error: "Export not configured" });
  }
  const key = req.query.key;
  if (typeof key !== "string" || key !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const rows: any[] = await prisma.$queryRaw`
    SELECT * FROM guest_surveys ORDER BY created_at DESC LIMIT 2000
  `;

  const FORMULA_CHARS = new Set(["=", "+", "-", "@"]);
  const csvEscape = (v: unknown) => {
    let s = String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ");
    if (s.length > 0 && FORMULA_CHARS.has(s[0])) s = "'" + s;
    return `"${s}"`;
  };

  const headers = [
    "Date", "Segment", "Name", "Email", "Phone", "Unit",
    "Review Rating", "Traveled From",
    // Open-text answers
    "What Stood Out / Appreciated", "One Change",
    "5-Star Fix",
    // Intent
    "Return Intent", "Would Book Direct",
    // Airport + travel
    "Travel Origin", "Travel City", "Airport Future Interest", "Airport Price",
    "Airport Method", "Airport Cost", "Airport Interest",
    // Services
    "Used Laundry", "Would Pay Wash Fold", "Wash Fold Price", "Wash Fold Bucket",
    "Would Buy Items",
    // Wine / past
    "Total Wine Interest",
    // Gift card
    "Gift Card Choice", "Gift Card Email", "Gift Card Type",
    // Misc
    "Preferred Discount", "Book Direct Reason", "Referral Code", "Birthday",
  ];

  let csv = headers.join(",") + "\n";
  for (const r of rows) {
    const birthday = r.birthday
      ? new Date(r.birthday).toLocaleDateString("en-US", { month: "long", day: "numeric" })
      : "";
    csv += [
      r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "",
      csvEscape(r.segment ?? ""),
      csvEscape(r.guest_name),
      csvEscape(r.guest_email),
      csvEscape(r.guest_phone),
      csvEscape(r.property_name),
      r.review_rating ?? "",
      csvEscape(r.traveled_from),
      csvEscape(r.highlight ?? r.what_liked ?? ""),
      csvEscape(r.what_different ?? ""),
      csvEscape(r.five_star_improvement ?? r.five_star_fix ?? ""),
      csvEscape(r.return_intent ?? ""),
      csvEscape(r.would_book_direct ?? ""),
      csvEscape(r.travel_origin ?? ""),
      csvEscape(r.travel_city ?? ""),
      csvEscape(r.airport_future_interest ?? ""),
      csvEscape(r.airport_price ?? ""),
      csvEscape(r.airport_method ?? ""),
      csvEscape(r.airport_cost ?? ""),
      csvEscape(r.airport_interest ?? ""),
      r.used_laundry ? "Yes" : "No",
      r.would_pay_wash_fold ? "Yes" : "No",
      csvEscape(r.wash_fold_price ?? ""),
      r.wash_fold_price_bucket ?? "",
      csvEscape(r.would_buy_items ?? ""),
      csvEscape(r.total_wine_interest ?? ""),
      csvEscape(r.gift_card_choice ?? ""),
      csvEscape(r.gift_card_email ?? ""),
      csvEscape(r.gift_card_type ?? ""),
      csvEscape(r.preferred_discount ?? ""),
      csvEscape(r.book_direct_reason ?? ""),
      csvEscape(r.referral_code ?? ""),
      csvEscape(birthday),
    ].join(",") + "\n";
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=survey_responses_${new Date().toISOString().split("T")[0]}.csv`,
  );
  return res.status(200).send(csv);
}
