import { NextRequest, NextResponse } from "next/server";
// Deploy this same repository as a second Railway service with
// NEXT_PUBLIC_SITE_BRAND=precision. Branding never depends on an untrusted Host header.
export function proxy(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_SITE_BRAND !== "precision")
    return NextResponse.next();
  const path = req.nextUrl.pathname;
  if (path === "/robots.txt") {
    return new NextResponse("User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /portal\nSitemap: https://staywithprecision.com/sitemap.xml\n", { headers: { "Content-Type": "text/plain" } });
  }
  if (
    path === "/" ||
    path === "/properties" ||
    /^\/properties\/[1-9]\d*$/.test(path)
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/precision" + (path === "/" ? "" : path);
    return NextResponse.rewrite(url);
  }
  if (path === "/portal") {
    return NextResponse.redirect(
      process.env.NEXT_PUBLIC_RENTER_PORTAL_URL ||
        "https://precision-admin-production.up.railway.app/portal",
    );
  }
  if (path === "/api/rental-inquiry") return NextResponse.next();
  if (path.startsWith("/api/") && path !== "/api/rental-inquiry")
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (path === "/sitemap.xml") {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://staywithprecision.com/</loc></url><url><loc>https://staywithprecision.com/properties</loc></url></urlset>',
      { headers: { "Content-Type": "application/xml" } },
    );
  }
  if (
    !path.startsWith("/precision") &&
    !path.startsWith("/_next") &&
    !/\.[a-z0-9]+$/.test(path)
  )
    return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
