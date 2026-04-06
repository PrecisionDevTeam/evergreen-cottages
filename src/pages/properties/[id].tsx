import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getProperty, getCalendar } from "../../lib/db";
import { useState } from "react";

type Props = {
  property: any;
  calendar: any[];
};

const PropertyDetail = ({ property, calendar }: Props) => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = property.images || [];

  if (!property) {
    return <div className="min-h-screen flex items-center justify-center">Property not found</div>;
  }

  // Extract unit number
  const unitMatch = property.name.match(/[Uu]nit\s*(\d+)/);
  const unitNumber = unitMatch ? unitMatch[1] : "";

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{property.name} — Evergreen Cottages</title>
      </Head>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-evergreen-700">
              Evergreen Cottages
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/properties" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Properties</Link>
              <Link href="/services" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Services</Link>
              <Link href="/about" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link href="/properties" className="text-evergreen-600 text-sm mb-4 inline-block hover:underline">
          &larr; All Properties
        </Link>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
        <p className="text-gray-500 mb-6">{property.address || "3801 Mobile Hwy, Pensacola, FL 32505"}</p>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-200">
            {images[currentImage] && (
              <img src={images[currentImage]} alt={property.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {images.slice(1, 5).map((img: string, i: number) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-80"
                onClick={() => setCurrentImage(i + 1)}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Details */}
          <div className="lg:col-span-2">
            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b">
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {property.person_capacity || 2} guests
              </div>
              {property.bedrooms_number ? (
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {property.bedrooms_number} bedroom
                </div>
              ) : null}
              <div className="flex items-center text-gray-600">
                <span className="mr-1.5">🚿</span>
                {property.bathrooms_number || 1} bath ({property.bathroom_type || "private"})
              </div>
              {property.pets_allowed && (
                <div className="flex items-center text-evergreen-600">
                  <span className="mr-1.5">🐾</span>
                  Pets allowed
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About this property</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {property.description || "A comfortable vacation rental in Pensacola, FL."}
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenityList.map((amenity: string) => (
                  <div key={amenity} className="flex items-center text-gray-600 text-sm">
                    <svg className="w-4 h-4 mr-2 text-evergreen-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Check-in Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Check-in Details</h2>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-in</span>
                  <span className="font-medium">4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-out</span>
                  <span className="font-medium">{property.check_out_time || 11}:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-right">{property.address || "3801 Mobile Hwy, Pensacola, FL"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                ${property.base_price || 65}<span className="text-base font-normal text-gray-500">/night</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">+ ${property.cleaning_fee || 65} cleaning fee</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Check-in</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Check-out</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Guests</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {Array.from({ length: property.person_capacity || 2 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="w-full bg-evergreen-600 text-white py-3 rounded-lg font-semibold hover:bg-evergreen-700 mb-3">
                Book Now
              </button>
              <p className="text-center text-xs text-gray-400">Book direct and save 10-15%</p>
            </div>
          </div>
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

export default PropertyDetail;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = parseInt(params?.id as string);
  if (isNaN(id)) return { notFound: true };

  const property = await getProperty(id);
  if (!property) return { notFound: true };

  const calendar = await getCalendar(id);

  return {
    props: {
      property: JSON.parse(JSON.stringify(property)),
      calendar: JSON.parse(JSON.stringify(calendar)),
    },
  };
};
