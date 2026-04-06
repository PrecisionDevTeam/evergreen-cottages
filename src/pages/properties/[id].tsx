import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import Layout from "../../components/Layout";
import AvailabilityCalendar from "../../components/AvailabilityCalendar";
import { getProperty, getCalendar, getPropertyReviews } from "../../lib/db";
import { Property, CalendarDay, Review } from "../../types";

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
    if (!checkIn || !checkOut) return;
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
        <Link href="/properties" className="text-ocean-500 text-sm mb-4 inline-flex items-center hover:text-coral-500 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Properties
        </Link>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-ocean-800 mt-3 mb-1">{property.name}</h1>
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white shadow-md z-10"
                  onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1)); }}
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4 text-ocean-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white shadow-md z-10"
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
                  <span className="font-medium">{property.check_out_time || 11}:00 AM</span>
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
                ${property.base_price || 65}<span className="text-base font-normal text-sand-400">/night</span>
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

              <button
                onClick={handleBookNow}
                disabled={!checkIn || !checkOut}
                className={`w-full py-3.5 rounded-xl font-semibold transition-colors mb-2 ${
                  checkIn && checkOut
                    ? "bg-ocean-500 text-white hover:bg-ocean-600 cursor-pointer"
                    : "bg-sand-200 text-sand-400 cursor-not-allowed"
                }`}
              >
                {priceCalc ? `Book Now — $${priceCalc.total}` : "Select dates to book"}
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

      {/* Mobile sticky booking bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-sand-200 px-4 py-3 flex items-center justify-between lg:hidden z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div>
          <span className="text-lg font-bold text-ocean-500 font-serif">${property.base_price || 65}</span>
          <span className="text-sand-400 text-sm">/night</span>
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
          {priceCalc ? `Book — $${priceCalc.total}` : "Select dates"}
        </button>
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

  const [calendar, reviews] = await Promise.all([
    getCalendar(property.hostaway_property_id, 180),
    getPropertyReviews(property.hostaway_property_id, 6),
  ]);

  return {
    props: {
      property: JSON.parse(JSON.stringify(property)),
      calendar: JSON.parse(JSON.stringify(calendar)),
      reviews: JSON.parse(JSON.stringify(reviews)),
    },
  };
};
