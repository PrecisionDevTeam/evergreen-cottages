import { GetServerSideProps } from "next";
import { useState, useMemo } from "react";
import Layout from "../../components/Layout";
import { prisma } from "../../lib/db";
import * as crypto from "crypto";

type CalendarDay = {
  date: string;
  price: number;
  available: boolean;
};

type Props = {
  propertyId: number;
  propertyName: string;
  propertyImage: string;
  currentCheckout: string;
  guestFirstName: string;
  guests: number;
  originalReservationId: number;
  hostawayListingId: string;
  calendar: CalendarDay[];
  basePrice: number;
};

export default function ExtendStay({
  propertyId,
  propertyName,
  propertyImage,
  currentCheckout,
  guestFirstName,
  guests,
  originalReservationId,
  hostawayListingId,
  calendar,
  basePrice,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentCheckoutFormatted = new Date(currentCheckout + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  // Calculate available dates (consecutive from current checkout)
  const availableDates = useMemo(() => {
    const dates: CalendarDay[] = [];
    for (const day of calendar) {
      if (!day.available) break; // Stop at first unavailable
      dates.push(day);
    }
    return dates;
  }, [calendar]);

  // Calculate pricing
  const pricing = useMemo(() => {
    if (!selectedDate) return null;
    let total = 0;
    let nights = 0;
    for (const day of availableDates) {
      nights++;
      total += day.price || basePrice;
      if (day.date === selectedDate) break;
    }
    return { nights, total, perNight: nights > 0 ? Math.round(total / nights) : 0 };
  }, [selectedDate, availableDates, basePrice]);

  async function handleExtend() {
    if (!selectedDate || !pricing) return;
    setLoading(true);
    setError("");

    try {
      const resp = await fetch("/api/extension-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          checkIn: currentCheckout,
          checkOut: selectedDate,
          guests,
          originalReservationId,
        }),
      });

      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Layout title={`Extend Your Stay — ${propertyName}`} description="Extend your stay with no extra cleaning fee.">
      <div className="max-w-lg mx-auto px-5 sm:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ocean-900 mb-2">Extend Your Stay</h1>
          <p className="text-ocean-600">{propertyName}</p>
        </div>

        {/* Property image */}
        {propertyImage && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img src={propertyImage} alt={propertyName} className="w-full h-48 object-cover" />
          </div>
        )}

        {/* Current checkout */}
        <div className="bg-sand-100 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <polyline points="12 6 12 12 16 14" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-ocean-500">Current checkout</p>
            <p className="font-semibold text-ocean-900">{currentCheckoutFormatted}</p>
          </div>
        </div>

        {/* Date picker */}
        {availableDates.length > 0 ? (
          <>
            <h2 className="font-display text-lg text-ocean-900 mb-3">Pick your new checkout date</h2>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {availableDates.map((day) => {
                const d = new Date(day.date + "T12:00:00");
                const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
                const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const isSelected = selectedDate === day.date;

                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? "border-ocean-500 bg-ocean-50 shadow-sm"
                        : "border-sand-200 bg-white hover:border-ocean-300"
                    }`}
                  >
                    <p className={`text-xs ${isSelected ? "text-ocean-600 font-semibold" : "text-ocean-400"}`}>{dayLabel}</p>
                    <p className={`font-semibold ${isSelected ? "text-ocean-900" : "text-ocean-700"}`}>{dateLabel}</p>
                    <p className="text-xs text-ocean-400 mt-1">${Math.round(day.price || basePrice)}/nt</p>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-coral-700 font-medium">No available dates for extension</p>
            <p className="text-coral-500 text-sm mt-1">Another guest is checking in after you, or dates are blocked.</p>
          </div>
        )}

        {/* Pricing */}
        {pricing && (
          <div className="bg-white border border-sand-200 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-ocean-600">${pricing.perNight} x {pricing.nights} night{pricing.nights > 1 ? "s" : ""}</span>
              <span className="text-ocean-900 font-semibold">${pricing.total}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-ocean-600">Cleaning fee</span>
              <span className="text-evergreen-600 font-semibold">Waived</span>
            </div>
            <div className="border-t border-sand-200 pt-3 flex justify-between items-center">
              <span className="text-ocean-900 font-bold">Total</span>
              <span className="text-ocean-900 font-bold text-xl">${pricing.total}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleExtend}
          disabled={!selectedDate || loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            selectedDate && !loading
              ? "bg-ocean-800 text-white hover:bg-ocean-900 shadow-md hover:shadow-lg"
              : "bg-sand-200 text-sand-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Processing..." : selectedDate ? `Pay $${pricing?.total || 0} & Extend` : "Select a checkout date"}
        </button>

        {/* Fine print */}
        <p className="text-center text-ocean-400 text-xs mt-4 leading-relaxed">
          No extra cleaning fee since you&apos;re already here.
          Your door code stays the same.
          {guestFirstName && <> Hi {guestFirstName}!</>}
        </p>

        {/* Contact */}
        <div className="text-center mt-8">
          <a href="tel:+15108227060" className="text-ocean-500 text-sm hover:text-ocean-700">
            Questions? Call (510) 822-7060
          </a>
        </div>
      </div>
    </Layout>
  );
}

// --- Server-side ---

function verifyToken(token: string): { reservationId: number; guestId: number } | null {
  const secret = process.env.EXTENSION_SECRET || "";
  if (!secret) {
    console.error("EXTENSION_SECRET env var not set — extension links disabled");
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const resId = parseInt(parts[0], 10);
    const guestId = parseInt(parts[1], 10);
    const sig = parts[2];

    if (!Number.isInteger(resId) || !Number.isInteger(guestId)) return null;

    // Validate signature is proper hex (sha256 = 64 hex chars)
    if (!/^[0-9a-f]{64}$/i.test(sig)) return null;

    const payload = `${resId}:${guestId}`;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }

    return { reservationId: resId, guestId: guestId };
  } catch {
    return null;
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.params?.token as string;
  if (!token) return { notFound: true };

  const decoded = verifyToken(token);
  if (!decoded) return { notFound: true };

  // Fetch reservation + property + guest
  const reservation = await prisma.reservation.findUnique({
    where: { id: decoded.reservationId },
    include: {
      property: {
        include: { knowledge: true },
      },
      guest: true,
    },
  });

  if (!reservation || !reservation.property || !reservation.check_out) {
    return { notFound: true };
  }

  // Check reservation hasn't expired (checkout must be today or future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkout = new Date(reservation.check_out);
  checkout.setHours(0, 0, 0, 0);
  if (checkout < today) {
    return { notFound: true };
  }

  // Fetch calendar starting from checkout date
  const hostawayListingId = reservation.property.hostaway_property_id || "";
  const checkoutStr = checkout.toISOString().split("T")[0];
  const calendarEnd = new Date(checkout);
  calendarEnd.setDate(calendarEnd.getDate() + 14); // 2 weeks max

  const calendarRows = await prisma.calendarDay.findMany({
    where: {
      hostaway_listing_id: hostawayListingId,
      date: { gte: checkout, lte: calendarEnd },
    },
    orderBy: { date: "asc" },
  });

  // Skip the checkout date itself (that's the last night of original stay)
  const calendar: CalendarDay[] = calendarRows
    .filter((d) => {
      const dStr = String(d.date).split("T")[0];
      return dStr > checkoutStr;
    })
    .map((d) => ({
      date: String(d.date).split("T")[0],
      price: d.price || reservation.property!.base_price || 65,
      available: d.is_available === 1,
    }));

  // Get property image
  let propertyImage = "";
  try {
    const images = reservation.property.listing_images
      ? JSON.parse(reservation.property.listing_images)
      : [];
    propertyImage = images[0] || "";
  } catch {
    propertyImage = "";
  }

  return {
    props: {
      propertyId: reservation.property.id,
      propertyName: reservation.property.name,
      propertyImage,
      currentCheckout: checkoutStr,
      guestFirstName: reservation.guest?.first_name || "",
      guests: reservation.adults || 1,
      originalReservationId: reservation.id,
      hostawayListingId,
      calendar,
      basePrice: reservation.property.base_price || 65,
    },
  };
};
