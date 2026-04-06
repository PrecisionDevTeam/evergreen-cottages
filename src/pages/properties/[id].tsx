import { GetServerSideProps } from "next";
import Image from "next/image";
import { useState, useMemo } from "react";
import Layout from "../../components/Layout";
import { getProperty, getCalendar } from "../../lib/db";
import { Property, CalendarDay } from "../../types";

type Props = {
  property: Property & { knowledgeMap: Record<string, string | null> };
  calendar: CalendarDay[];
};

function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
    .replace(/[•●◦▪▸►]/g, "–")
    .replace(/\s{3,}/g, "\n\n")
    .replace(/^\s+/gm, "")
    .trim();
}

const PropertyDetail = ({ property, calendar }: Props) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const images = property.images || [];

  // Calculate price
  const priceCalc = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    if (nights <= 0) return null;
    const nightly = property.base_price || 65;
    const cleaning = property.cleaning_fee || 65;
    const subtotal = nights * nightly;
    const total = subtotal + cleaning;
    return { nights, nightly, cleaning, subtotal, total };
  }, [checkIn, checkOut, property.base_price, property.cleaning_fee]);

  // Blocked dates
  const blockedDates = useMemo(() => {
    return new Set(
      calendar
        .filter((d) => !d.is_available)
        .map((d) => d.date?.split("T")[0])
        .filter(Boolean)
    );
  }, [calendar]);

  const today = new Date().toISOString().split("T")[0];

  const handleBookNow = () => {
    const subject = encodeURIComponent(
      `Booking Request: ${property.name} | ${checkIn || "TBD"} to ${checkOut || "TBD"} | ${guests} guest(s)`
    );
    const body = encodeURIComponent(
      `Hi, I'd like to book:\n\nProperty: ${property.name}\nCheck-in: ${checkIn || "TBD"}\nCheck-out: ${checkOut || "TBD"}\nGuests: ${guests}\n${priceCalc ? `\nEstimated Total: $${priceCalc.total}` : ""}\n\nPlease confirm availability and send me a payment link.\n\nThank you!`
    );
    window.location.href = `mailto:hello@staywithprecision.com?subject=${subject}&body=${body}`;
  };

  return (
    <Layout title={property.name} description={property.description ? stripEmojis(property.description).slice(0, 160) : undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back */}
        <a href="/properties" className="text-evergreen-600 text-sm mb-4 inline-flex items-center hover:underline">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Properties
        </a>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-1">{property.name}</h1>
        <p className="text-gray-500 mb-6">{property.address || "3801 Mobile Hwy, Pensacola, FL 32505"}</p>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 rounded-2xl overflow-hidden">
          <div
            className="aspect-[4/3] bg-gray-200 relative cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          >
            {images[currentImage] && (
              <Image
                src={images[currentImage]}
                alt={property.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            )}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              {currentImage + 1} / {images.length}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {images.slice(1, 5).map((img, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-gray-200 relative cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => { setCurrentImage(i + 1); setLightboxOpen(true); }}
              >
                <Image src={img} alt={`${property.name} photo ${i + 2}`} fill className="object-cover" sizes="25vw" />
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
            <button className="absolute top-4 right-4 text-white text-3xl z-50" onClick={() => setLightboxOpen(false)} aria-label="Close gallery">&times;</button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl z-50 hover:opacity-70"
              onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1)); }}
              aria-label="Previous image"
            >
              &#8249;
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl z-50 hover:opacity-70"
              onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p < images.length - 1 ? p + 1 : 0)); }}
              aria-label="Next image"
            >
              &#8250;
            </button>
            <div className="relative w-full max-w-4xl aspect-[3/2] mx-4" onClick={(e) => e.stopPropagation()}>
              {images[currentImage] && (
                <Image src={images[currentImage]} alt={property.name} fill className="object-contain" sizes="100vw" />
              )}
            </div>
            <div className="absolute bottom-6 text-white text-sm">{currentImage + 1} / {images.length}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Details */}
          <div className="lg:col-span-2">
            {/* Quick Info */}
            <div className="flex flex-wrap gap-5 mb-6 pb-6 border-b">
              {/* Guests */}
              <div className="flex items-center text-sand-600 text-sm">
                <svg className="w-5 h-5 mr-2 text-sand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {property.person_capacity || 2} guests
              </div>
              {/* Bedroom */}
              {property.bedrooms_number ? (
                <div className="flex items-center text-sand-600 text-sm">
                  <svg className="w-5 h-5 mr-2 text-sand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v11a1 1 0 001 1h16a1 1 0 001-1V7M3 7l3-4h12l3 4M8 11h8M8 11V7m8 4V7" />
                  </svg>
                  {property.bedrooms_number} bedroom
                </div>
              ) : null}
              {/* Bathroom */}
              <div className="flex items-center text-sand-600 text-sm">
                <svg className="w-5 h-5 mr-2 text-sand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {property.bathrooms_number || 1} bath
              </div>
              {/* Pets */}
              {property.pets_allowed && (
                <div className="flex items-center text-evergreen-600 text-sm font-medium">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-.632-.103l-2.828-.94a2 2 0 01-.632-.103H4.5A1.5 1.5 0 013 18.5v-5A1.5 1.5 0 014.5 12H7l3-6a1 1 0 011.8.4L10 10z" />
                  </svg>
                  Pets allowed ($50 fee)
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About this property</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                {stripEmojis(property.description || "A comfortable vacation rental in Pensacola, FL.")}
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenityList.map((amenity) => (
                  <div key={amenity} className="flex items-center text-gray-600 text-sm">
                    <svg className="w-4 h-4 mr-2 text-evergreen-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Check-in Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Check-in Details</h2>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-sm">
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
                <div className="flex justify-between">
                  <span className="text-gray-500">Smart Lock</span>
                  <span className="font-medium">Keyless entry — code sent before arrival</span>
                </div>
              </div>
            </div>

            {/* Cancellation */}
            <div className="mb-8 p-6 bg-evergreen-50 rounded-xl">
              <h3 className="font-semibold text-evergreen-800 mb-1">Flexible Cancellation</h3>
              <p className="text-sm text-evergreen-700">Free cancellation up to 48 hours before check-in. Contact us for details.</p>
            </div>
          </div>

          {/* Right — Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-0.5">
                ${property.base_price || 65}<span className="text-base font-normal text-gray-500">/night</span>
              </div>
              <p className="text-xs text-gray-400 mb-6">+ ${property.cleaning_fee || 65} cleaning fee</p>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Check-in</label>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-evergreen-500 focus:border-evergreen-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Check-out</label>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-evergreen-500 focus:border-evergreen-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-evergreen-500 focus:border-evergreen-500 outline-none"
                  >
                    {Array.from({ length: property.person_capacity || 2 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price breakdown */}
              {priceCalc && (
                <div className="border-t border-gray-100 pt-4 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>${priceCalc.nightly} x {priceCalc.nights} night{priceCalc.nights > 1 ? "s" : ""}</span>
                    <span>${priceCalc.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Cleaning fee</span>
                    <span>${priceCalc.cleaning}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>${priceCalc.total}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookNow}
                className="w-full bg-evergreen-600 text-white py-3 rounded-lg font-semibold hover:bg-evergreen-700 transition-colors mb-2"
              >
                {priceCalc ? `Book Now — $${priceCalc.total}` : "Book Now"}
              </button>
              <p className="text-center text-xs text-gray-400">Book direct &amp; save 10-15% vs Airbnb</p>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <a
                  href="tel:+15108227060"
                  className="flex items-center justify-center text-sm text-evergreen-600 font-medium hover:text-evergreen-700"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call or text (510) 822-7060
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetail;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = parseInt(params?.id as string);
  if (isNaN(id)) return { notFound: true };

  const property = await getProperty(id);
  if (!property) return { notFound: true };

  const calendar = await getCalendar(id, 180);

  return {
    props: {
      property: JSON.parse(JSON.stringify(property)),
      calendar: JSON.parse(JSON.stringify(calendar)),
    },
  };
};
