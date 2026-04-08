import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import Layout from "../../components/Layout";
import AvailabilityCalendar from "../../components/AvailabilityCalendar";
import { getProperty, getCalendar, getPropertyReviews } from "../../lib/db";
import { Property, CalendarDay, Review } from "../../types";
import { useRecentlyViewed } from "../../lib/localStorage";
import Breadcrumbs from "../../components/Breadcrumbs";

type Props = {
  property: Property & { knowledgeMap: Record<string, string | null> };
  calendar: CalendarDay[];
  reviews: Review[];
};

function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
    .replace(/[•●◦▪▸►]/g, "–")
    .replace(/\s{3,}/g, "\n\n")
    .replace(/^\s+/gm, "")
    .trim();
}

// Sections that don't belong on a marketing page
const HIDDEN_SECTION_KEYWORDS = [
  "reminder", "disclaimer", "note", "a few notes", "please be advised",
  "neighborhood", "bug", "insect", "pest", "florida's warm",
];

function isSectionHidden(title: string): boolean {
  const lower = title.toLowerCase();
  return HIDDEN_SECTION_KEYWORDS.some((kw) => lower.includes(kw));
}

function formatDescription(raw: string): { intro: string; sections: { title: string; items: string[] }[] } {
  const cleaned = stripEmojis(raw);
  const lines = cleaned.split("\n").map((l) => l.trim()).filter(Boolean);

  const intro: string[] = [];
  const allSections: { title: string; items: string[] }[] = [];
  let currentSection: { title: string; items: string[] } | null = null;

  for (const line of lines) {
    const isHeader = line.length < 50 && !line.startsWith("–") && !line.startsWith("-") &&
      /^[A-Z]/.test(line) && !line.includes("–") && line.split(" ").length <= 6;

    if (isHeader && (intro.length > 0 || allSections.length > 0)) {
      if (currentSection) allSections.push(currentSection);
      currentSection = { title: line, items: [] };
    } else if (currentSection) {
      currentSection.items.push(line.replace(/^[-–]\s*/, ""));
    } else {
      intro.push(line);
    }
  }
  if (currentSection) allSections.push(currentSection);

  const sections = allSections.filter((s) => !isSectionHidden(s.title));

  return { intro: intro.join("\n\n"), sections };
}

const VISIBLE_SECTIONS = 2;

function SectionBlock({ section }: { section: { title: string; items: string[] } }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-ocean-500 uppercase tracking-wide mb-2">
        {section.title}
      </h3>
      <ul className="space-y-1.5">
        {section.items.map((item, j) => (
          <li key={j} className="text-sand-600 text-sm flex items-start">
            <span className="text-sand-300 mr-2 mt-1.5 flex-shrink-0">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Description({ raw, expanded, onToggle }: { raw: string; expanded: boolean; onToggle: () => void }) {
  const desc = formatDescription(raw);
  const hasMore = desc.sections.length > VISIBLE_SECTIONS;
  const visibleSections = expanded ? desc.sections : desc.sections.slice(0, VISIBLE_SECTIONS);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">About this property</h2>
      <div className="text-sand-600 leading-relaxed text-sm space-y-3 mb-6">
        {desc.intro.split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {visibleSections.map((section, i) => (
        <SectionBlock key={i} section={section} />
      ))}
      {hasMore && (
        <button onClick={onToggle} className="text-ocean-500 font-medium text-sm hover:text-coral-500 transition-colors">
          {expanded ? "Show less" : `Read more (${desc.sections.length - VISIBLE_SECTIONS} more sections)`}
        </button>
      )}
    </div>
  );
}

function AmenitiesSection({ amenityList, expanded, onToggle }: { amenityList: string[]; expanded: boolean; onToggle: () => void }) {
  const unique = useMemo(() => {
    const dupes = new Set(["Wireless", "wireless", "Internet"]);
    const cleaned = amenityList
      .filter((a) => !dupes.has(a))
      .map((a) => (a === "Internet" || a === "Wireless") ? "WiFi" : a);
    return Array.from(new Set(cleaned));
  }, [amenityList]);

  const shown = expanded ? unique : unique.slice(0, 9);
  const remaining = unique.length - 9;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {shown.map((amenity) => (
          <div key={amenity} className="flex items-center text-sand-600 text-sm">
            <svg className="w-4 h-4 mr-2 text-evergreen-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {amenity}
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <button onClick={onToggle} className="text-ocean-500 font-medium text-sm mt-4 hover:text-coral-500 transition-colors">
          {expanded ? "Show less" : `Show all ${unique.length} amenities`}
        </button>
      )}
    </div>
  );
}

const PropertyDetail = ({ property, calendar, reviews }: Props) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const { recentlyViewed, addViewed } = useRecentlyViewed();

  useEffect(() => {
    addViewed(property);
  }, [property.id, addViewed]);

  const otherRecent = recentlyViewed.filter((r) => r.id !== property.id);

  const images = property.images || [];

  // Build calendar price lookup
  const calendarPrices = useMemo(() => {
    const map: Record<string, number> = {};
    for (const day of calendar) {
      if (day.date && day.price) {
        map[day.date.split("T")[0]] = day.price;
      }
    }
    return map;
  }, [calendar]);

  // Calculate price using actual calendar rates per night
  const priceCalc = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    if (nights <= 0) return null;
    const fallback = property.base_price || 65;
    const cleaning = property.cleaning_fee || 65;

    // Sum actual nightly prices from calendar
    let subtotal = 0;
    for (let i = 0; i < nights; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      subtotal += calendarPrices[key] || fallback;
    }
    const nightly = Math.round(subtotal / nights);
    const total = subtotal + cleaning;
    return { nights, nightly, cleaning, subtotal, total };
  }, [checkIn, checkOut, calendarPrices, property.base_price, property.cleaning_fee]);

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
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Check out ${property.name} — $${property.base_price || 65}/night in Pensacola, FL`;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.name, text, url });
      } catch {
        // user cancelled share dialog
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard not available (HTTP, iframe, denied)
      }
    }
  };

  const [bookingLoading, setBookingLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ promoId: string; name: string; discount: { type: string; value: number } } | null>(null);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    try {
      const res = await fetch("/api/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoResult(data);
      } else {
        setPromoError(data.error || "Invalid code");
        setPromoResult(null);
      }
    } catch {
      setPromoError("Could not validate code");
    }
  };

  const handleBookNow = async () => {
    if (!checkIn || !checkOut || bookingLoading) return;
    setBookingLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn,
          checkOut,
          guests,
          promoId: promoResult?.promoId || undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Checkout failed");
      }
    } catch (err) {
      setBookingLoading(false);
      const message = err instanceof Error ? err.message : "Something went wrong";
      alert(`Booking error: ${message}. Please call (510) 822-7060 to book.`);
    }
  };

  return (
    <Layout
      title={property.name}
      description={property.description ? stripEmojis(property.description).slice(0, 160) : undefined}
      schema={(() => {
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
          : 0;
        return {
          "@context": "https://schema.org",
          "@type": "VacationRental",
          name: property.name,
          description: property.description ? stripEmojis(property.description).slice(0, 300) : undefined,
          address: {
            "@type": "PostalAddress",
            streetAddress: property.address || "3801 Mobile Highway",
            addressLocality: "Pensacola",
            addressRegion: "FL",
            postalCode: "32505",
            addressCountry: "US",
          },
          ...(property.lat && property.lng ? {
            geo: { "@type": "GeoCoordinates", latitude: property.lat, longitude: property.lng },
          } : {}),
          image: images[0] || undefined,
          priceRange: `$${property.base_price || 65}/night`,
          telephone: "+15108227060",
          url: `https://evergreencottages.com/properties/${property.id}`,
          ...(avgRating > 0 ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: avgRating.toFixed(1),
              reviewCount: reviews.length,
              bestRating: 5,
            },
          } : {}),
          amenityFeature: property.amenityList.slice(0, 10).map((a) => ({
            "@type": "LocationFeatureSpecification",
            name: a,
            value: true,
          })),
          numberOfRooms: property.bedrooms_number || 1,
          petsAllowed: property.pets_allowed || false,
        };
      })()}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        <Breadcrumbs items={[
          { label: "Properties", href: "/properties" },
          { label: property.name },
        ]} />

        {/* Title */}
        <div className="flex items-start justify-between mt-3 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-ocean-800">{property.name}</h1>
          <button
            onClick={handleShare}
            className="flex-shrink-0 ml-4 mt-1 flex items-center gap-1.5 text-sm text-sand-500 hover:text-ocean-500 transition-colors"
            aria-label="Share property"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
        <p className="text-sand-500 mb-6">{property.address || "3801 Mobile Highway, Pensacola, FL 32505"}</p>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 rounded-2xl overflow-hidden">
          <div
            className="aspect-[4/3] bg-sand-200 relative cursor-pointer group"
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
            {/* Prev/Next arrows — always visible on mobile, hover on desktop */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white shadow-md z-10"
                  onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1)); }}
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4 text-ocean-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white shadow-md z-10"
                  onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p < images.length - 1 ? p + 1 : 0)); }}
                  aria-label="Next image"
                >
                  <svg className="w-4 h-4 text-ocean-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              {currentImage + 1} / {images.length}
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-2">
            {images.slice(1, 5).map((img, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-sand-200 relative cursor-pointer hover:opacity-90 transition-opacity"
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
            <button className="absolute top-4 right-4 text-white text-3xl z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors" onClick={() => setLightboxOpen(false)} aria-label="Close gallery">&times;</button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl z-50 hover:opacity-70 w-12 h-12 flex items-center justify-center rounded-full bg-white/10"
              onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1)); }}
              aria-label="Previous image"
            >
              &#8249;
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl z-50 hover:opacity-70 w-12 h-12 flex items-center justify-center rounded-full bg-white/10"
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
            <Description
              raw={property.description || "A comfortable vacation rental in Pensacola, FL."}
              expanded={descExpanded}
              onToggle={() => setDescExpanded(!descExpanded)}
            />

            {/* Amenities */}
            <AmenitiesSection
              amenityList={property.amenityList}
              expanded={amenitiesExpanded}
              onToggle={() => setAmenitiesExpanded(!amenitiesExpanded)}
            />

            {/* Check-in Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Check-in Details</h2>
              <div className="bg-sand-50 rounded-xl p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-sand-500">Check-in</span>
                  <span className="font-medium">{property.check_in_time != null ? `${property.check_in_time % 12 || 12}:00 ${property.check_in_time >= 12 ? "PM" : "AM"}` : "4:00 PM"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand-500">Check-out</span>
                  <span className="font-medium">{property.check_out_time != null ? `${property.check_out_time % 12 || 12}:00 ${property.check_out_time >= 12 ? "PM" : "AM"}` : "11:00 AM"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand-500">Address</span>
                  <span className="font-medium text-right">{property.address || "3801 Mobile Highway, Pensacola, FL"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand-500">Smart Lock</span>
                  <span className="font-medium">Keyless entry — code sent before arrival</span>
                </div>
              </div>
            </div>

            {/* Location Map */}
            {property.lat && property.lng && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="rounded-2xl overflow-hidden border border-sand-200">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(property.lng - 0.01).toFixed(4)}%2C${(property.lat - 0.008).toFixed(4)}%2C${(property.lng + 0.01).toFixed(4)}%2C${(property.lat + 0.008).toFixed(4)}&layer=mapnik&marker=${property.lat.toFixed(4)}%2C${property.lng.toFixed(4)}`}
                    width="100%"
                    height="280"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Property location"
                  />
                </div>
                <p className="text-xs text-sand-400 mt-2">
                  {property.address || "3801 Mobile Highway, Pensacola, FL 32505"}
                </p>

                {/* Nearby places */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { name: "Pensacola Beach", dist: "20 min", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
                    { name: "Downtown Pensacola", dist: "10 min", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                    { name: "NAS Pensacola", dist: "15 min", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
                    { name: "Airport (PNS)", dist: "15 min", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
                    { name: "Cordova Mall", dist: "12 min", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                    { name: "Joe Patti's Seafood", dist: "10 min", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" },
                  ].map((place) => (
                    <div key={place.name} className="flex items-center gap-2 text-xs text-sand-500 py-1.5">
                      <svg className="w-3.5 h-3.5 text-ocean-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={place.icon} />
                      </svg>
                      <span>{place.name}</span>
                      <span className="text-sand-400 ml-auto">{place.dist}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guest Reviews */}
            {reviews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Guest Reviews
                  <span className="ml-2 text-base font-normal text-sand-400">
                    ({reviews.length})
                  </span>
                </h2>
                <div className="space-y-4">
                  {(reviewsExpanded ? reviews : reviews.slice(0, 3)).map((review) => (
                    <div key={review.id} className="border border-sand-100 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-ocean-600">{review.reviewer_name}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < (review.rating || 0) ? "text-yellow-400" : "text-sand-200"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sand-600 text-sm leading-relaxed">{review.review_content}</p>
                      {review.submitted_at && (
                        <p className="text-sand-400 text-xs mt-2">
                          {new Date(review.submitted_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {reviews.length > 3 && (
                  <button
                    onClick={() => setReviewsExpanded(!reviewsExpanded)}
                    className="text-ocean-500 font-medium text-sm mt-4 hover:text-coral-500 transition-colors"
                  >
                    {reviewsExpanded ? "Show less" : `Show all ${reviews.length} reviews`}
                  </button>
                )}
              </div>
            )}

            {/* Cancellation */}
            <div className="mb-8 p-6 bg-evergreen-50 rounded-xl">
              <h3 className="font-semibold text-evergreen-800 mb-1">Flexible Cancellation</h3>
              <p className="text-sm text-evergreen-700">Free cancellation up to 48 hours before check-in. Contact us for details.</p>
            </div>
          </div>

          {/* Right — Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-sand-200 rounded-2xl p-5 sticky top-24 shadow-sm">
              <div className="text-2xl font-bold text-ocean-500 mb-0.5 font-serif">
                {priceCalc
                  ? <>${Math.round(priceCalc.nightly)}<span className="text-base font-normal text-sand-400">/night</span></>
                  : <><span className="text-base font-normal text-sand-400">from </span>${property.base_price || 65}<span className="text-base font-normal text-sand-400">/night</span></>
                }
              </div>
              <p className="text-xs text-sand-400 mb-4">+ ${property.cleaning_fee || 65} cleaning fee</p>

              {/* Calendar */}
              <AvailabilityCalendar
                calendar={calendar}
                checkIn={checkIn}
                checkOut={checkOut}
                onDateSelect={(date) => {
                  if (!checkIn || (checkIn && checkOut)) {
                    setCheckIn(date);
                    setCheckOut("");
                  } else {
                    if (date > checkIn) {
                      const hasBlockedInRange = Array.from(blockedDates).some(
                        (d) => d && d > checkIn && d < date
                      );
                      if (hasBlockedInRange) {
                        setCheckIn(date);
                        setCheckOut("");
                      } else {
                        setCheckOut(date);
                      }
                    } else {
                      setCheckIn(date);
                      setCheckOut("");
                    }
                  }
                }}
              />

              {/* Selected dates summary */}
              {(checkIn || checkOut) && (
                <div className="flex gap-2 mb-3 text-xs">
                  <div className={`flex-1 rounded-lg p-2.5 border ${checkIn ? "border-ocean-500 bg-ocean-50" : "border-sand-200"}`}>
                    <div className="text-sand-400 mb-0.5">Check-in</div>
                    <div className="font-medium text-ocean-600">{checkIn ? new Date(checkIn + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Select"}</div>
                  </div>
                  <div className={`flex-1 rounded-lg p-2.5 border ${checkOut ? "border-ocean-500 bg-ocean-50" : "border-sand-200"}`}>
                    <div className="text-sand-400 mb-0.5">Check-out</div>
                    <div className="font-medium text-ocean-600">{checkOut ? new Date(checkOut + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Select"}</div>
                  </div>
                </div>
              )}

              {/* Guests */}
              <div className="mb-4">
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full border border-sand-200 rounded-lg px-3 py-2.5 text-sm text-sand-600 bg-sand-50 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                  aria-label="Number of guests"
                >
                  {Array.from({ length: property.person_capacity || 2 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Price breakdown */}
              {priceCalc && (
                <div className="border-t border-sand-100 pt-3 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-sand-500">
                    <span>${priceCalc.nightly} x {priceCalc.nights} night{priceCalc.nights > 1 ? "s" : ""}</span>
                    <span>${priceCalc.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sand-500">
                    <span>Cleaning fee</span>
                    <span>${priceCalc.cleaning}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-ocean-500 pt-2 border-t border-sand-100">
                    <span>Total</span>
                    <span>${priceCalc.total}</span>
                  </div>
                </div>
              )}

              {/* Promo code */}
              {priceCalc && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }}
                      placeholder="Promo code"
                      className="flex-1 border border-sand-200 rounded-lg px-3 py-2 text-sm bg-sand-50 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                      aria-label="Promo code"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2 text-sm font-medium text-ocean-500 border border-ocean-500 rounded-lg hover:bg-ocean-50 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoResult && (
                    <p className="text-xs text-evergreen-600 mt-1.5">
                      {promoResult.name} — {promoResult.discount.type === "percent" ? `${promoResult.discount.value}% off` : `$${promoResult.discount.value} off`} (applied at checkout)
                    </p>
                  )}
                  {promoError && <p className="text-xs text-coral-500 mt-1.5">{promoError}</p>}
                </div>
              )}

              <button
                onClick={handleBookNow}
                disabled={!checkIn || !checkOut || bookingLoading}
                className={`w-full py-3.5 rounded-xl font-semibold transition-colors mb-2 ${
                  checkIn && checkOut && !bookingLoading
                    ? "bg-ocean-500 text-white hover:bg-ocean-600 cursor-pointer"
                    : "bg-sand-200 text-sand-400 cursor-not-allowed"
                }`}
              >
                {bookingLoading ? "Redirecting to payment..." : priceCalc ? `Book Now — $${priceCalc.total}` : "Select dates to book"}
              </button>
              <p className="text-center text-xs text-sand-400">Book direct &amp; save 10-15% vs Airbnb</p>

              <div className="mt-4 pt-4 border-t border-sand-100">
                <a
                  href="tel:+15108227060"
                  className="flex items-center justify-center text-sm text-ocean-500 font-medium hover:text-coral-500 transition-colors"
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

      {/* Recently Viewed */}
      {otherRecent.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-xl font-semibold mb-4">Recently Viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {otherRecent.slice(0, 4).map((item) => (
              <Link key={item.id} href={`/properties/${item.id}`} className="flex-shrink-0 w-48 group">
                <div className="aspect-[3/2] bg-sand-200 rounded-xl overflow-hidden relative mb-2">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="192px" />
                  )}
                </div>
                <p className="text-sm font-medium text-ocean-600 group-hover:text-coral-500 transition-colors truncate">{item.name}</p>
                <p className="text-xs text-sand-400">${item.price}/night</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile sticky booking bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-sand-200 px-4 py-3 flex items-center justify-between lg:hidden z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div>
          {priceCalc ? (
            <>
              <span className="text-lg font-bold text-ocean-500 font-serif">${Math.round(priceCalc.nightly)}</span>
              <span className="text-sand-400 text-sm">/night</span>
            </>
          ) : (
            <>
              <span className="text-sand-400 text-xs">from </span>
              <span className="text-lg font-bold text-ocean-500 font-serif">${property.base_price || 65}</span>
              <span className="text-sand-400 text-sm">/night</span>
            </>
          )}
        </div>
        <button
          onClick={handleBookNow}
          disabled={!checkIn || !checkOut}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
            checkIn && checkOut
              ? "bg-ocean-500 text-white hover:bg-ocean-600"
              : "bg-sand-200 text-sand-400 cursor-not-allowed"
          }`}
        >
          {bookingLoading ? "Processing..." : priceCalc ? `Book — $${priceCalc.total}` : "Select dates"}
        </button>
      </div>
    </Layout>
  );
};

export default PropertyDetail;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = parseInt(params?.id as string);
  if (isNaN(id) || id <= 0 || id > 2_147_483_647) return { notFound: true };

  const property = await getProperty(id);
  if (!property) return { notFound: true };

  const [calendar, reviews] = await Promise.all([
    getCalendar(property.hostaway_property_id, 180).catch(() => []),
    getPropertyReviews(property.hostaway_property_id, 6).catch(() => []),
  ]);

  return {
    props: {
      property: JSON.parse(JSON.stringify(property)),
      calendar: JSON.parse(JSON.stringify(calendar)),
      reviews: JSON.parse(JSON.stringify(reviews)),
    },
  };
};
