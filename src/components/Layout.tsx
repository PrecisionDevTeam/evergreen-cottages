import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  dark?: boolean;
};

const navLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Layout({ children, title, description, dark }: Props) {
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
        <meta property="og:image" content="https://evergreencottages.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        {description && <meta name="twitter:description" content={description} />}
        <meta name="twitter:image" content="https://evergreencottages.com/og-image.jpg" />
        <meta name="theme-color" content="#1a3a4a" />
        <link rel="icon" href="/favicon.ico" />
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
            <Link
              href="/"
              className={`text-xl font-serif tracking-tight transition-colors ${
                scrolled || !dark ? "text-ocean-500" : "text-white"
              }`}
            >
              Evergreen Cottages
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

      {/* Footer */}
      <footer className="bg-ocean-500 text-white/80 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10">
            <div className="md:col-span-1">
              <h3 className="font-serif text-xl text-white mb-4">Evergreen<br />Cottages</h3>
              <p className="text-sm leading-relaxed">
                17 vacation rentals in Pensacola, Florida. Book direct for the best rates.
              </p>
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Navigate</h4>
              <div className="flex flex-col space-y-2.5 text-sm">
                <Link href="/properties" className="hover:text-white transition-colors">Properties</Link>
                <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
                <Link href="/services" className="hover:text-white transition-colors">Services</Link>
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
              </div>
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Location</h4>
              <p className="text-sm leading-relaxed">
                3801 Mobile Highway<br />
                Pensacola, FL 32505
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs">
            <span>&copy; {new Date().getFullYear()} Evergreen Cottages</span>
            <span className="mt-2 sm:mt-0">Managed by Precision Management</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
