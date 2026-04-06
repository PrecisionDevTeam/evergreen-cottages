import Link from "next/link";
import Image from "next/image";
import { Property } from "../types";

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
        {property.images[0] ? (
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sand-400 font-serif text-lg">
            No photo
          </div>
        )}
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

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
