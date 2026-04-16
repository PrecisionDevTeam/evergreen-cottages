import { NextApiRequest, NextApiResponse } from "next";
import { getStayByToken } from "../../lib/db";
import { verifyOrigin, rateLimit } from "../../lib/api-security";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!verifyOrigin(req, res)) return;
  if (!rateLimit(req, res, 20)) return;

  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }

  const stay = await getStayByToken(token);
  if (!stay) {
    return res.status(404).json({ error: "Invalid or expired token" });
  }

  return res.status(200).json({
    guestName: [stay.guest?.first_name, stay.guest?.last_name].filter(Boolean).join(" ") || "",
    propertyName: stay.property?.name || "",
    unitLabel: stay.property?.name?.match(/Unit\s*(\d+)/i)?.[1] || "",
  });
}
