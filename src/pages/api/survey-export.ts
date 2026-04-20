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

  const format = req.query.format;

  if (format === "csv") {
    const rows: any[] = await prisma.$queryRaw`
      SELECT * FROM guest_surveys ORDER BY created_at DESC
    `;

    const headers = [
      "Name", "Email", "Phone", "Unit", "Overall", "Cleanliness", "Check-in", "Value",
      "Traveled From", "Book Direct?", "Airport Pickup?", "Would Buy Items",
      "Used Laundry?", "Wash & Fold?", "W&F Price", "Discount",
      "Birthday", "What Liked", "What Different", "Gift Card Email", "Gift Card Type", "Gift Card Sent?", "Date"
    ];

    const csvEscape = (v: unknown) =>
      `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

    let csv = headers.join(",") + "\n";
    for (const r of rows) {
      csv += [
        csvEscape(r.guest_name),
        csvEscape(r.guest_email),
        csvEscape(r.guest_phone),
        csvEscape(r.property_name),
        r.overall_rating ?? "",
        r.cleanliness_rating ?? "",
        r.checkin_rating ?? "",
        r.value_rating ?? "",
        csvEscape(r.traveled_from),
        csvEscape(r.would_book_direct),
        r.airport_pickup ? "Yes" : "No",
        csvEscape(r.would_buy_items),
        r.used_laundry ? "Yes" : "No",
        r.would_pay_wash_fold ? "Yes" : "No",
        csvEscape(r.wash_fold_price),
        csvEscape(r.preferred_discount),
        r.birthday ? new Date(r.birthday).toISOString().split("T")[0] : "",
        csvEscape(r.what_liked),
        csvEscape(r.what_different),
        csvEscape(r.gift_card_email),
        csvEscape(r.gift_card_type),
        r.gift_card_sent ? "Yes" : "No",
        r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "",
      ].join(",") + "\n";
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=survey_responses_${new Date().toISOString().split("T")[0]}.csv`);
    return res.status(200).send(csv);
  }

  // JSON summary
  const stats: any[] = await prisma.$queryRaw`
    SELECT
      COUNT(*)::int as total,
      ROUND(AVG(overall_rating), 1) as avg_overall,
      ROUND(AVG(cleanliness_rating), 1) as avg_cleanliness,
      COUNT(*) FILTER (WHERE would_book_direct = 'yes')::int as would_book_direct,
      COUNT(*) FILTER (WHERE used_laundry = true)::int as used_laundry,
      COUNT(*) FILTER (WHERE would_pay_wash_fold = true)::int as would_pay_wash_fold,
      COUNT(*) FILTER (WHERE gift_card_sent = false)::int as pending_gift_cards
    FROM guest_surveys
  `;

  return res.status(200).json({
    total: stats[0]?.total || 0,
    stats: stats[0],
    csvUrl: `/api/survey-export?key=${encodeURIComponent(key)}&format=csv`,
  });
}
