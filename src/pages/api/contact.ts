import { NextApiRequest, NextApiResponse } from "next";
import { verifyOrigin, rateLimit, safeString } from "../../lib/api-security";
import { prisma } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!verifyOrigin(req, res)) return;
  if (!rateLimit(req, res, 5)) return;

  const name = safeString(req.body.name, 100);
  const email = safeString(req.body.email, 200);
  const message = safeString(req.body.message, 2000);

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    // Store in DB so messages are never lost
    await prisma.$executeRaw`
      INSERT INTO contact_submissions (name, email, message, created_at)
      VALUES (${name}, ${email}, ${message}, NOW())
    `;

    // Log only metadata (no PII)
    console.log("CONTACT_FORM:", JSON.stringify({
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    }));

    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to send. Please call (510) 822-7060." });
  }
}
