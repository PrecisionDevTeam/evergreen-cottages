import Link from "next/link";
import { Property } from "../types";
import ImageCarousel from "./ImageCarousel";

type Props = {
  property: Property;
  priority?: boolean;
};

export default function PropertyCard({ property, priority = false }: Props) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block card-lift fade-in-up"
    >
      <div className="aspect-[3/2] bg-sand-200 relative overflow-hidden rounded-2xl">
        <ImageCarousel
          images={property.images.slice(0, 8)}
          alt={property.name}
          priority={priority}
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 text-white">
          <span className="text-lg font-serif">${property.base_price || 65}</span>
          <span className="text-xs text-white/70 ml-0.5">/night</span>
        </div>

        {/* Tags */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {property.pets_allowed && (
            <span className="bg-ocean-500/90 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm">
              Pets OK
            </span>
          )}
          {(property.person_capacity || 2) >= 4 && (
            <span className="bg-coral-500/90 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm">
              {property.person_capacity} guests
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 pb-2">
        <h3 className="font-serif text-lg text-ocean-500 group-hover:text-coral-500 transition-colors leading-snug mb-2">
          {property.name}
        </h3>
        <div className="flex items-center text-sm text-sand-500">
          <span>{property.person_capacity || 2} guests</span>
          <span className="mx-2 text-sand-300">&bull;</span>
          <span>{property.bathrooms_number || 1} bath</span>
          {property.bedrooms_number ? (
            <>
              <span className="mx-2 text-sand-300">&bull;</span>
              <span>{property.bedrooms_number} bed</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
