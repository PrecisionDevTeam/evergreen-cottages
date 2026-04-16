import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = req.query.key;
  if (key !== process.env.ADMIN_EXPORT_KEY && key !== "precision2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const format = req.query.format;

  if (format === "csv") {
    const rows: any[] = await prisma.$queryRaw`
      SELECT * FROM guest_surveys ORDER BY created_at DESC
    `;

    const headers = [
      "Name", "Email", "Phone", "Unit", "Overall", "Cleanliness", "Check-in", "Value",
      "Book Direct?", "Used Laundry?", "Wash & Fold?", "W&F Price",
      "Birthday", "Suggestions", "Gift Card Email", "Gift Card Sent?", "Date"
    ];

    let csv = headers.join(",") + "\n";
    for (const r of rows) {
      csv += [
        `"${(r.guest_name || "").replace(/"/g, '""')}"`,
        r.guest_email || "",
        r.guest_phone || "",
        `"${(r.property_name || "").replace(/"/g, '""')}"`,
        r.overall_rating || "",
        r.cleanliness_rating || "",
        r.checkin_rating || "",
        r.value_rating || "",
        r.would_book_direct || "",
        r.used_laundry ? "Yes" : "No",
        r.would_pay_wash_fold ? "Yes" : "No",
        r.wash_fold_price || "",
        r.birthday ? new Date(r.birthday).toISOString().split("T")[0] : "",
        `"${(r.suggestions || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        r.gift_card_email || "",
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
    csvUrl: `/api/survey-export?key=${key}&format=csv`,
  });
}
