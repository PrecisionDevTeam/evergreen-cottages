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
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group"
    >
      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
        {property.images[0] ? (
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No photo
          </div>
        )}
        {property.pets_allowed && (
          <span className="absolute top-3 left-3 bg-evergreen-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            Pets OK
          </span>
        )}
        <span className="absolute top-3 right-3 bg-white/95 text-gray-900 text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
          From ${property.base_price || 65}/night
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-evergreen-700 transition-colors">
          {property.name}
        </h3>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>{property.person_capacity || 2} guests</span>
          <span className="mx-1.5">&middot;</span>
          <span>{property.bathrooms_number || 1} bath</span>
          {property.bedrooms_number ? (
            <>
              <span className="mx-1.5">&middot;</span>
              <span>{property.bedrooms_number} bed</span>
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {property.amenityList.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {amenity}
            </span>
          ))}
          {property.amenityList.length > 4 && (
            <span className="text-xs text-gray-400">
              +{property.amenityList.length - 4} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
