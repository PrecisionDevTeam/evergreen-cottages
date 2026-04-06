import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
};

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-sand-400 mb-4">
      <ol className="flex items-center flex-wrap gap-1">
        <li>
          <Link href="/" className="hover:text-ocean-500 transition-colors">Home</Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1">
            <svg className="w-3 h-3 text-sand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}
