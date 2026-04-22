import Link from "next/link";
import Head from "next/head";

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
};

export default function Breadcrumbs({ items }: Props) {
  // Build BreadcrumbList schema
  const allCrumbs = [{ label: "Home", href: "/" }, ...items];
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allCrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `https://www.evergreencottagespensacola.com${crumb.href}` } : {}),
    })),
  };

  // Safe serialization — all values are from static code, not user input.
  // Unicode escapes prevent any HTML parser injection in script tags.
  const safeSchema = JSON.stringify(breadcrumbSchema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeSchema }}
        />
      </Head>
      <nav aria-label="Breadcrumb" className="text-xs text-sand-400 mb-4">
        <ol className="flex items-center flex-wrap gap-1">
          <li>
            <Link href="/" className="hover:text-ocean-500 transition-colors">Home</Link>
          </li>
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-1">
              <svg className="w-3 h-3 text-sand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {item.href ? (
                <Link href={item.href} className="hover:text-ocean-500 transition-colors">{item.label}</Link>
              ) : (
                <span className="text-sand-600">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
