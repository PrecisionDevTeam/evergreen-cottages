import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name, email, phone, property,
    overall, cleanliness, checkin, value,
    traveledFrom, whatLiked, whatDifferent,
    bookDirect, airportPickup, wouldBuyItems,
    usedLaundry, washFold, washFoldPrice,
    discount, birthday, giftCardEmail, giftCardType,
  } = req.body;

  if (!name || !email || !overall || !cleanliness || !checkin || !value) {
    return res.status(400).json({ error: "Name, email, and all ratings are required" });
  }
  if (!traveledFrom?.trim() || !whatLiked?.trim() || !bookDirect || !discount) {
    return res.status(400).json({ error: "Please complete all required questions" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const birthdayValue = birthday && /^\d{4}-\d{2}-\d{2}$/.test(birthday) ? birthday : null;

  try {
    await prisma.$executeRaw`
      INSERT INTO guest_surveys
        (guest_name, guest_phone, guest_email, property_name,
         overall_rating, cleanliness_rating, checkin_rating, value_rating,
         traveled_from, what_liked, what_different,
         would_book_direct, airport_pickup, would_buy_items,
         used_laundry, would_pay_wash_fold, wash_fold_price,
         preferred_discount, birthday, gift_card_email, gift_card_type)
       VALUES (
         ${(name || "").slice(0, 100)},
         ${(phone || "").slice(0, 20)},
         ${(email || "").slice(0, 100)},
         ${(property || "").slice(0, 100)},
         ${Math.min(Math.max(1, overall || 1), 5)},
         ${Math.min(Math.max(1, cleanliness || 1), 5)},
         ${checkin ? Math.min(Math.max(1, checkin), 5) : null},
         ${value ? Math.min(Math.max(1, value), 5) : null},
         ${(traveledFrom || "").slice(0, 200)},
         ${(whatLiked || "").slice(0, 1000)},
         ${(whatDifferent || "").slice(0, 1000)},
         ${(bookDirect || "").slice(0, 20)},
         ${airportPickup || false},
         ${(wouldBuyItems || "nothing").slice(0, 500)},
         ${usedLaundry || false},
         ${washFold || false},
         ${(washFoldPrice || "").slice(0, 10)},
         ${(discount || "").slice(0, 50)},
         ${birthdayValue ? new Date(birthdayValue) : null},
         ${(giftCardEmail || email || "").slice(0, 100)},
         ${(giftCardType || "amazon").slice(0, 20)}
       )`;

    // Discord notification
    try {
      const discordWebhook = process.env.DISCORD_SURVEY_WEBHOOK;
      if (discordWebhook) {
        await fetch(discordWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `New Survey Response\n` +
              `Guest: ${(name || "").slice(0, 50)}\n` +
              `Unit: ${(property || "N/A").slice(0, 50)} | From: ${(traveledFrom || "N/A").slice(0, 50)}\n` +
              `Overall: ${overall}/5 | Cleanliness: ${cleanliness}/5\n` +
              `Book direct: ${bookDirect || "N/A"} | Airport pickup: ${airportPickup ? "Yes" : "No"}\n` +
              `Laundry: ${usedLaundry ? "Yes" : "No"} | W&F: ${washFold ? `Yes (${washFoldPrice})` : "No"}\n` +
              `Discount: ${discount || "N/A"} | Gift card: ${giftCardType || "amazon"}\n` +
              (whatLiked ? `Liked: "${(whatLiked || "").slice(0, 150)}"\n` : "") +
              (whatDifferent ? `Different: "${(whatDifferent || "").slice(0, 150)}"` : ""),
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
