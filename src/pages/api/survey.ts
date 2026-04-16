import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name, email, phone, property,
    overall, cleanliness, checkin, value,
    bookDirect, usedLaundry, washFold, washFoldPrice,
    birthday, suggestions, giftCardEmail,
  } = req.body;

  if (!name || !email || !overall || !cleanliness) {
    return res.status(400).json({ error: "Name, email, and ratings are required" });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // Validate birthday format
  const birthdayValue = birthday && /^\d{4}-\d{2}-\d{2}$/.test(birthday) ? birthday : null;

  const pool = getPool();

  try {
    await pool.query(
      `INSERT INTO guest_surveys
        (guest_name, guest_phone, guest_email, property_name,
         overall_rating, cleanliness_rating, checkin_rating, value_rating,
         would_book_direct, used_laundry, would_pay_wash_fold, wash_fold_price,
         birthday, suggestions, gift_card_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        (name || "").slice(0, 100),
        (phone || "").slice(0, 20),
        (email || "").slice(0, 100),
        (property || "").slice(0, 100),
        Math.min(Math.max(1, overall || 1), 5),
        Math.min(Math.max(1, cleanliness || 1), 5),
        checkin ? Math.min(Math.max(1, checkin), 5) : null,
        value ? Math.min(Math.max(1, value), 5) : null,
        (bookDirect || "").slice(0, 20),
        usedLaundry || false,
        washFold || false,
        (washFoldPrice || "").slice(0, 10),
        birthdayValue,
        (suggestions || "").slice(0, 1000),
        (giftCardEmail || email || "").slice(0, 100),
      ]
    );

    // Notify Noah via Discord
    try {
      const discordWebhook = process.env.DISCORD_SURVEY_WEBHOOK;
      if (discordWebhook) {
        await fetch(discordWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `📋 **New Survey Response**\n` +
              `Guest: ${(name || "").slice(0, 50)}\n` +
              `Unit: ${(property || "N/A").slice(0, 50)}\n` +
              `Overall: ${"⭐".repeat(overall)} (${overall}/5)\n` +
              `Cleanliness: ${"⭐".repeat(cleanliness)} (${cleanliness}/5)\n` +
              `Book direct: ${bookDirect || "N/A"}\n` +
              `Used laundry: ${usedLaundry ? "Yes" : "No"}\n` +
              `Wash & fold: ${washFold ? `Yes (${washFoldPrice})` : "No"}\n` +
              (suggestions ? `💬 "${suggestions.slice(0, 200)}"` : ""),
          }),
        });
      }
    } catch {
      // Non-critical
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Survey submission error:", err);
    return res.status(500).json({ error: "Failed to save survey" });
  }
}
