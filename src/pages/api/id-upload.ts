import { NextApiRequest, NextApiResponse } from "next";
import { verifyOrigin, rateLimit } from "../../lib/api-security";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!verifyOrigin(req, res)) return;
  if (!rateLimit(req, res, 5)) return;

  const { photo, guestName, guestEmail, propertyName, stripeSessionId } = req.body;

  if (!photo) {
    return res.status(400).json({ error: "No photo provided" });
  }

  const dataHubUrl = process.env.DATA_HUB_URL || "https://hostaway-data-hub-production-ffd2.up.railway.app";

  try {
    // Photo comes as base64 data URL from client
    const base64Match = String(photo).match(/^data:(image\/\w+);base64,(.+)$/);
    if (!base64Match) {
      return res.status(400).json({ error: "Invalid photo format" });
    }

    const contentType = base64Match[1];
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(contentType)) {
      return res.status(400).json({ error: "Invalid file type. Use JPEG, PNG, or WebP." });
    }

    const photoBuffer = Buffer.from(base64Match[2], "base64");
    if (photoBuffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "Photo too large (max 10 MB)" });
    }

    const blob = new Blob([photoBuffer], { type: contentType });
    const ext = contentType.split("/")[1] || "jpg";

    const formData = new FormData();
    formData.append("photo", blob, `id.${ext}`);
    formData.append("guestName", String(guestName || "").slice(0, 100));
    formData.append("guestEmail", String(guestEmail || "").slice(0, 100));
    formData.append("propertyName", String(propertyName || "").slice(0, 100));
    formData.append("stripeSessionId", String(stripeSessionId || "").slice(0, 100));

    const response = await fetch(`${dataHubUrl}/id-verification/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WEBHOOK_SECRET || ""}`,
      },
      body: formData,
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    }

    return res.status(500).json({ error: "Upload failed" });
  } catch {
    return res.status(502).json({ error: "Connection error" });
  }
}
