import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

const navLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Layout({ children, title, description }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const pageTitle = title
    ? `${title} — Evergreen Cottages`
    : "Evergreen Cottages — Vacation Rentals in Pensacola, FL";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Head>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={pageTitle} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-evergreen-700">
              Evergreen Cottages
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    router.pathname.startsWith(link.href)
                      ? "text-evergreen-700 font-semibold"
                      : "text-gray-600 hover:text-evergreen-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/properties"
                className="bg-evergreen-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-evergreen-700 transition-colors"
              >
                Book Direct
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-gray-600 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block text-base font-medium py-2 ${
                    router.pathname.startsWith(link.href)
                      ? "text-evergreen-700"
                      : "text-gray-600"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/properties"
                className="block bg-evergreen-600 text-white px-4 py-3 rounded-lg text-center font-medium mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Direct
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Evergreen Cottages</h3>
              <p className="text-sm leading-relaxed">
                17 professionally managed vacation rentals in Pensacola, Florida. Minutes from the beach.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="flex flex-col space-y-2 text-sm">
                <Link href="/properties" className="hover:text-white transition-colors">Properties</Link>
                <Link href="/services" className="hover:text-white transition-colors">Services</Link>
                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <div className="text-sm space-y-2">
                <a href="tel:+15108227060" className="block hover:text-white transition-colors">
                  (510) 822-7060
                </a>
                <a href="mailto:hello@staywithprecision.com" className="block hover:text-white transition-colors">
                  hello@staywithprecision.com
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Location</h3>
              <p className="text-sm">
                3801 Mobile Highway<br />
                Pensacola, FL 32505
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            &copy; {new Date().getFullYear()} Evergreen Cottages. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
