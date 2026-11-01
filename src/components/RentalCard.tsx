import Link from "next/link";
import { RentalListing } from "../lib/rental-catalog";
import { precisionBase } from "./PrecisionLayout";
export default function RentalCard({ listing: l }: { listing: RentalListing }) {
  const rate =
    l.nightly_cents && l.rental_terms.includes("short")
      ? "$" + (l.nightly_cents / 100).toLocaleString() + "/night"
      : l.monthly_cents
        ? "$" + (l.monthly_cents / 100).toLocaleString() + "/month"
        : "Ask for pricing";
  return (
    <Link
      href={precisionBase + "/properties/" + l.property_id}
      className="group block"
    >
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-sand-200 relative">
        {l.image_url ? (
          <img
            src={l.image_url}
            alt={l.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-sand-500 font-serif text-2xl">
            Your next chapter
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {l.rental_terms.map((t) => (
            <span
              key={t}
              className="bg-white/95 rounded-full text-[10px] uppercase tracking-wider px-3 py-1.5"
            >
              {t} term
            </span>
          ))}
        </div>
      </div>
      <div className="pt-5">
        <p className="text-xs tracking-widest uppercase text-sand-500 mb-2">
          {[l.city, l.state].filter(Boolean).join(", ")}
        </p>
        <h3 className="font-serif text-2xl group-hover:text-coral-500">
          {l.title}
        </h3>
        <p className="text-sm text-sand-500 mt-2">
          {l.bedrooms_number !== null ? l.bedrooms_number + " bedrooms" : ""}
          {l.bathrooms_number !== null
            ? " · " + l.bathrooms_number + " baths"
            : ""}
        </p>
        <div className="mt-4 flex justify-between text-sm">
          <span>{rate}</span>
          <span className="text-coral-500">Explore home ↗</span>
        </div>
      </div>
    </Link>
  );
}
