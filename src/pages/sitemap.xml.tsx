import { GetServerSideProps } from "next";
import { getProperties } from "../lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.evergreencottagespensacola.com";

function Sitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const properties = await getProperties("Pensacola");

  const staticPages = [
    "",
    "/properties",
    "/services",
    "/about",
    "/contact",
    "/faq",
    "/gallery",
  ];

  const propertyPages = properties.map(
    (p) => `/properties/${p.id}`
  );

  const allPages = [...staticPages, ...propertyPages];
  const today = new Date().toISOString().split("T")[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path === "" ? "weekly" : path.startsWith("/properties/") ? "daily" : "monthly"}</changefreq>
    <priority>${path === "" ? "1.0" : path === "/properties" ? "0.9" : path.startsWith("/properties/") ? "0.8" : "0.6"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default Sitemap;
