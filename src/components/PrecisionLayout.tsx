import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
export const precisionBase =
  process.env.NEXT_PUBLIC_SITE_BRAND === "precision" ? "" : "/precision";
export const portalUrl =
  process.env.NEXT_PUBLIC_RENTER_PORTAL_URL ||
  "https://precision-admin-production.up.railway.app/portal";
export default function PrecisionLayout({
  children,
  title = "Homes for every chapter",
  description = "Find your next home with Precision. Short stays, extended stays and long term rentals.",
  dark = false,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  dark?: boolean;
}) {
  const router = useRouter(),
    [open, setOpen] = useState(false);
  const path = router.asPath.split("?")[0].replace(/^\/precision/, "");
  return (
    <div className="min-h-screen flex flex-col bg-sand-50 text-ocean-700 grain">
      <Head>
        <title>{title + " | Stay with Precision"}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={"https://staywithprecision.com" + path} />
        <meta property="og:title" content={title + " | Stay with Precision"} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Stay with Precision" />
      </Head>
      <header
        className={
          "absolute inset-x-0 top-0 z-20 border-b " +
          (dark
            ? "border-white/20 text-white"
            : "border-sand-200 text-ocean-700")
        }
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between gap-5">
          <Link
            href={precisionBase || "/"}
            className="font-serif text-2xl leading-none"
          >
            precision
            <span className="block text-[9px] tracking-[0.35em] font-sans uppercase mt-2">
              A place to belong
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href={precisionBase + "/properties"}>Find a home</Link>
            <a href={(precisionBase || "/") + "#ways-to-stay"}>Ways to stay</a>
            <a href="https://www.evergreencottagespensacola.com">
              Evergreen Cottages ↗
            </a>
            <a
              href={portalUrl}
              className={
                "rounded-full border px-5 py-2.5 " +
                (dark ? "border-white/40" : "border-ocean-500")
              }
            >
              Guest & resident login
            </a>
          </div>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            className="md:hidden border rounded-full px-4 py-2 text-sm"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </nav>
        {open && (
          <div className="md:hidden bg-sand-50 text-ocean-700 p-6 flex flex-col gap-5 border-b">
            <Link href={precisionBase + "/properties"}>Find a home</Link>
            <a href={portalUrl}>Guest & resident login</a>
            <a href="https://www.evergreencottagespensacola.com">
              Evergreen Cottages ↗
            </a>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-ocean-700 text-white px-6 py-16">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-10">
          <div>
            <p className="font-serif text-3xl mb-4">Stay with precision.</p>
            <p className="text-white/60 text-sm max-w-xs">
              Thoughtfully managed homes. A personal connection. For a few
              nights or your next chapter.
            </p>
          </div>
          <div className="text-sm space-y-3">
            <Link className="block" href={precisionBase + "/properties"}>
              Explore homes
            </Link>
            <a className="block" href={portalUrl}>
              Your guest & resident portal
            </a>
            <a
              className="block"
              href="https://www.evergreencottagespensacola.com"
            >
              Evergreen Cottages, Pensacola ↗
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50 mb-4">
              Let's find your place
            </p>
            <a className="block mb-3" href="mailto:hello@staywithprecision.com">
              hello@staywithprecision.com
            </a>
            <a className="text-sm" href="tel:+15108227060">
              (510) 822-7060
            </a>
          </div>
        </div>
        <p className="max-w-7xl mx-auto text-xs text-white/40 border-t border-white/10 pt-8 mt-12">
          © {new Date().getFullYear()} Precision Management · Equal housing
          opportunity
        </p>
      </footer>
    </div>
  );
}
