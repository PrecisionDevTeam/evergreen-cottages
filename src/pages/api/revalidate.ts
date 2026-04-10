import type { NextApiRequest, NextApiResponse } from "next";

/**
 * On-demand ISR revalidation endpoint.
 * Called by the admin dashboard "Publish" button to instantly update pages.
 *
 * POST /api/revalidate
 * Body: { "path": "/properties", "secret": "..." }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { path, secret } = req.body || {};
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return res.status(401).json({ error: "Invalid secret" });
  }

  const ALLOWED_PATHS = new Set(["/", "/properties", "/services", "/faq", "/about", "/gallery"]);
  if (!path || !ALLOWED_PATHS.has(path)) {
    return res.status(400).json({ error: "Invalid path" });
  }

  try {
    await res.revalidate(path);
    return res.json({ revalidated: true, path });
  } catch (err) {
    return res.status(500).json({ error: "Revalidation failed" });
  }
}
