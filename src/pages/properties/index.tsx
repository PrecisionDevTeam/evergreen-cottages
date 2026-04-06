import Head from "next/head";
import Link from "next/link";
import { getProperties } from "../../lib/db";

type Property = {
  id: number;
  name: string;
  person_capacity: number | null;
  bedrooms_number: number | null;
  bathrooms_number: number | null;
  base_price: number | null;
  cleaning_fee: number | null;
  pets_allowed: boolean | null;
  images: string[];
  amenityList: string[];
  description: string | null;
  address: string | null;
};

type Props = {
  properties: Property[];
};

const Properties = ({ properties }: Props) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Properties — Evergreen Cottages</title>
      </Head>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-evergreen-700">
              Evergreen Cottages
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/properties" className="text-evergreen-700 text-sm font-semibold">Properties</Link>
              <Link href="/services" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Services</Link>
              <Link href="/about" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">All Properties</h1>
          <p className="text-gray-500 mt-1">{properties.length} vacation rentals in Pensacola, FL</p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-gray-200 relative">
                {property.images[0] && (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {property.pets_allowed && (
                  <span className="absolute top-3 left-3 bg-evergreen-600 text-white text-xs px-2 py-1 rounded-full">
                    Pets OK
                  </span>
                )}
                <span className="absolute top-3 right-3 bg-white/90 text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                  From ${property.base_price || 65}/night
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{property.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>{property.person_capacity || 2} guests</span>
                  <span className="mx-1">&middot;</span>
                  <span>{property.bathrooms_number || 1} bath</span>
                  {property.bedrooms_number ? (
                    <>
                      <span className="mx-1">&middot;</span>
                      <span>{property.bedrooms_number} bed</span>
                    </>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {property.amenityList.slice(0, 5).map((amenity) => (
                    <span
                      key={amenity}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                  {property.amenityList.length > 5 && (
                    <span className="text-xs text-gray-400">
                      +{property.amenityList.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          &copy; {new Date().getFullYear()} Evergreen Cottages. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Properties;

export const getServerSideProps = async () => {
  const properties = await getProperties("Pensacola");
  return {
    props: {
      properties: JSON.parse(JSON.stringify(properties)),
    },
  };
};
