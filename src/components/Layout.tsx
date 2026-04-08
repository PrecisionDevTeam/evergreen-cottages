import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import CookieConsent from "./CookieConsent";
import ExitIntent from "./ExitIntent";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  dark?: boolean;
  schema?: Record<string, unknown>;
};

const navLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Layout({ children, title, description, dark, schema }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  const pageTitle = title
    ? `${title} — Evergreen Cottages`
    : "Evergreen Cottages — Vacation Rentals in Pensacola, FL";

  return (
    <div className="min-h-screen flex flex-col grain">
      <Head>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={pageTitle} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Evergreen Cottages" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://evergreencottages.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        {description && <meta name="twitter:description" content={description} />}
        <meta name="twitter:image" content="https://evergreencottages.com/og-image.png" />
        <meta name="theme-color" content="#1a3a4a" />
        <link rel="icon" type="image/png" href="/image.png" />
        <link rel="apple-touch-icon" href="/image.png" />
        {schema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026") }} />
        )}
        <link rel="canonical" href={`https://evergreencottages.com${router.asPath.split("?")[0]}`} />
      </Head>

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-sand-50/95 backdrop-blur-md shadow-sm"
            : dark
            ? "bg-transparent"
            : "bg-sand-50/70 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-18 py-4">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/image.png"
                alt="Evergreen Cottages"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover border-2 border-sand-200"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    router.pathname.startsWith(link.href)
                      ? scrolled || !dark
                        ? "text-ocean-500"
                        : "text-white"
                      : scrolled || !dark
                      ? "text-sand-600 hover:text-ocean-500"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/properties"
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  scrolled || !dark
                    ? "bg-ocean-500 text-white hover:bg-ocean-600"
                    : "bg-white text-ocean-500 hover:bg-white/90"
                }`}
              >
                Book Direct
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled || !dark ? "text-ocean-500" : "text-white"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-sand-50 border-t border-sand-200 fade-in">
            <div className="px-5 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block text-base font-medium py-3 px-4 rounded-lg transition-colors ${
                    router.pathname.startsWith(link.href)
                      ? "text-ocean-500 bg-ocean-50"
                      : "text-sand-600 hover:bg-sand-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/properties"
                className="block bg-ocean-500 text-white px-4 py-3.5 rounded-xl text-center font-semibold mt-4"
              >
                Book Direct &mdash; Save 10-15%
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed nav (skip if dark hero handles it) */}
      {!dark && <div className="h-18 pt-16" />}

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Floating SMS button */}
      <a
        href="sms:+15108227060"
        className="fixed bottom-20 right-5 lg:bottom-8 lg:right-8 w-14 h-14 bg-evergreen-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-evergreen-600 transition-all hover:scale-105 z-30"
        aria-label="Text us"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </a>

      {/* Footer */}
      <footer className="bg-ocean-500 text-white/80 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          {/* Top section — brand + CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-10 border-b border-white/10">
            <div>
              <span className="text-xl font-serif text-white">Evergreen Cottages</span>
              <p className="text-sm">17 vacation rentals in Pensacola, FL. Book direct and save.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/properties" className="bg-white text-ocean-600 px-6 py-3 rounded-full font-semibold text-sm text-center hover:bg-sand-100 transition-all">
                Browse Properties
              </Link>
              <a href="tel:+15108227060" className="border border-white/40 text-white px-6 py-3 rounded-full font-semibold text-sm text-center hover:bg-white/10 transition-all">
                (510) 822-7060
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Explore</h4>
              <div className="flex flex-col space-y-2.5 text-sm">
                <Link href="/properties" className="hover:text-white transition-colors">Properties</Link>
                <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
                <Link href="/guide" className="hover:text-white transition-colors">Area Guide</Link>
                <Link href="/services" className="hover:text-white transition-colors">Services</Link>
                <Link href="/gift-cards" className="hover:text-white transition-colors">Gift Cards</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Help</h4>
              <div className="flex flex-col space-y-2.5 text-sm">
                <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Contact</h4>
              <div className="text-sm space-y-2.5">
                <a href="tel:+15108227060" className="block hover:text-white transition-colors">
                  (510) 822-7060
                </a>
                <a href="mailto:hello@staywithprecision.com" className="block hover:text-white transition-colors">
                  hello@staywithprecision.com
                </a>
                <p className="text-white/50 text-xs mt-1">Call or text 24/7</p>
              </div>
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Location</h4>
              <p className="text-sm leading-relaxed">
                3801 Mobile Highway<br />
                Pensacola, FL 32505
              </p>
              <p className="text-white/50 text-xs mt-2">Minutes from the beach</p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
            <span>&copy; {new Date().getFullYear()} Evergreen Cottages</span>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
            <span className="mt-2 sm:mt-0">Managed by Precision Management</span>
          </div>
        </div>
      </footer>

      <CookieConsent />
      <ExitIntent />
    </div>
  );
}
