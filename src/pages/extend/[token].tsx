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

type VacantUnit = {
  propertyId: number;
  name: string;
  hostawayListingId: string;
  nightlyPrice: number;
};

type Props = {
  variant: "same" | "other";
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
  // other-unit only
  vacantUnits: VacantUnit[];
  discountPercent: number;
  unitChangeCleaningFee: number;
  token: string;
};

export default function ExtendStay(props: Props) {
  if (props.variant === "other") {
    return <ExtendStayOtherUnit {...props} />;
  }
  return <ExtendStaySameUnit {...props} />;
}

function ExtendStaySameUnit({
  propertyId,
  propertyName,
  propertyImage,
  currentCheckout,
  guestFirstName,
  guests,
  originalReservationId,
  calendar,
  basePrice,
  discountPercent,
  token,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentCheckoutFormatted = new Date(currentCheckout + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const availableDates = useMemo(() => {
    const dates: CalendarDay[] = [];
    for (const day of calendar) {
      if (!day.available) break;
      dates.push(day);
    }
    return dates;
  }, [calendar]);

  const pricing = useMemo(() => {
    if (!selectedDate) return null;
    let subtotal = 0;
    let nights = 0;
    for (const day of availableDates) {
      nights++;
      subtotal += day.price || basePrice;
      if (day.date === selectedDate) break;
    }
    const discounted = Math.round(subtotal * (1 - discountPercent / 100));
    return {
      nights,
      subtotal,
      discount: subtotal - discounted,
      total: discounted,
      perNight: nights > 0 ? Math.round(subtotal / nights) : 0,
    };
  }, [selectedDate, availableDates, basePrice, discountPercent]);

  async function handleExtend() {
    if (!selectedDate || !pricing) return;
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/extension-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          propertyId,
          checkIn: currentCheckout,
          checkOut: selectedDate,
          guests,
          originalReservationId,
          variant: "same",
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
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ocean-900 mb-2">Extend Your Stay</h1>
          <p className="text-ocean-600">{propertyName}</p>
        </div>

        {propertyImage && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img src={propertyImage} alt={propertyName} className="w-full h-48 object-cover" />
          </div>
        )}

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
                      isSelected ? "border-ocean-500 bg-ocean-50 shadow-sm" : "border-sand-200 bg-white hover:border-ocean-300"
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

        {pricing && (
          <div className="bg-white border border-sand-200 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-ocean-600">${pricing.perNight} x {pricing.nights} night{pricing.nights > 1 ? "s" : ""}</span>
              <span className="text-ocean-900">${pricing.subtotal}</span>
            </div>
            {discountPercent > 0 && pricing.discount > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-evergreen-700">Extension discount ({discountPercent}%)</span>
                <span className="text-evergreen-600 font-semibold">-${pricing.discount}</span>
              </div>
            )}
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

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

        <p className="text-center text-ocean-400 text-xs mt-4 leading-relaxed">
          No extra cleaning fee since you&apos;re already here. Your door code stays the same.
          {guestFirstName && <> Hi {guestFirstName}!</>}
        </p>

        <div className="text-center mt-8">
          <a href="tel:+15108227060" className="text-ocean-500 text-sm hover:text-ocean-700">
            Questions? Call (510) 822-7060
          </a>
        </div>
      </div>
    </Layout>
  );
}

function ExtendStayOtherUnit({
  propertyName,
  currentCheckout,
  guestFirstName,
  guests,
  originalReservationId,
  vacantUnits,
  discountPercent,
  unitChangeCleaningFee,
  token,
}: Props) {
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tomorrow = useMemo(() => {
    const d = new Date(currentCheckout + "T12:00:00");
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, [currentCheckout]);

  const selected = vacantUnits.find((u) => u.propertyId === selectedUnitId) || null;

  const pricing = useMemo(() => {
    if (!selected) return null;
    const subtotal = Math.round(selected.nightlyPrice);
    const discount = Math.round(subtotal * (discountPercent / 100));
    const total = subtotal - discount + unitChangeCleaningFee;
    return { subtotal, discount, cleaningFee: unitChangeCleaningFee, total };
  }, [selected, discountPercent, unitChangeCleaningFee]);

  async function handleExtend() {
    if (!selected || !pricing) return;
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/extension-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          propertyId: selected.propertyId,
          checkIn: currentCheckout,
          checkOut: tomorrow,
          guests,
          originalReservationId,
          variant: "other",
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

  const currentCheckoutFormatted = new Date(currentCheckout + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <Layout title="Extend Your Stay — Pick a Unit" description="Your unit is booked, but we have others open.">
      <div className="max-w-lg mx-auto px-5 sm:px-8 py-16">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ocean-900 mb-2">Extend Your Stay</h1>
          <p className="text-ocean-600">
            {propertyName} is booked tomorrow — but these units are open
          </p>
        </div>

        <div className="bg-sand-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-ocean-500">You check out</p>
          <p className="font-semibold text-ocean-900">{currentCheckoutFormatted}</p>
          <p className="text-xs text-ocean-500 mt-1">
            Move to one of these for +1 night. {discountPercent}% off nightly, reduced cleaning fee (${unitChangeCleaningFee}).
          </p>
        </div>

        {vacantUnits.length === 0 ? (
          <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-coral-700 font-medium">No units available right now</p>
            <p className="text-coral-500 text-sm mt-1">Check back soon or call us to see options.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {vacantUnits.map((unit) => {
              const isSelected = selectedUnitId === unit.propertyId;
              const discounted = Math.round(unit.nightlyPrice * (1 - discountPercent / 100));
              return (
                <button
                  key={unit.propertyId}
                  onClick={() => setSelectedUnitId(unit.propertyId)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected ? "border-ocean-500 bg-ocean-50 shadow-sm" : "border-sand-200 bg-white hover:border-ocean-300"
                  }`}
                >
                  <p className={`font-semibold ${isSelected ? "text-ocean-900" : "text-ocean-800"}`}>
                    {unit.name}
                  </p>
                  <div className="flex justify-between items-baseline mt-1">
                    <p className="text-ocean-500 text-sm">
                      <span className="line-through text-sand-400 mr-2">
                        ${Math.round(unit.nightlyPrice)}/nt
                      </span>
                      <span className="text-evergreen-600 font-semibold">
                        ${discounted}/nt
                      </span>
                    </p>
                    {isSelected && (
                      <span className="text-xs text-ocean-600 font-semibold">Selected</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {pricing && (
          <div className="bg-white border border-sand-200 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-ocean-600">1 night</span>
              <span className="text-ocean-900">${pricing.subtotal}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-evergreen-700">Extension discount ({discountPercent}%)</span>
                <span className="text-evergreen-600 font-semibold">-${pricing.discount}</span>
              </div>
            )}
            <div className="flex justify-between items-center mb-3">
              <span className="text-ocean-600">Cleaning fee (unit swap)</span>
              <span className="text-ocean-900">${pricing.cleaningFee}</span>
            </div>
            <div className="border-t border-sand-200 pt-3 flex justify-between items-center">
              <span className="text-ocean-900 font-bold">Total</span>
              <span className="text-ocean-900 font-bold text-xl">${pricing.total}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleExtend}
          disabled={!selected || loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            selected && !loading
              ? "bg-ocean-800 text-white hover:bg-ocean-900 shadow-md hover:shadow-lg"
              : "bg-sand-200 text-sand-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Processing..." : selected ? `Pay $${pricing?.total || 0} & Book` : "Pick a unit"}
        </button>

        <p className="text-center text-ocean-400 text-xs mt-4 leading-relaxed">
          Switching units means a new door code will be texted to you and a reduced cleaning fee applies.
          {guestFirstName && <> Hi {guestFirstName}!</>}
        </p>

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

type Decoded = {
  reservationId: number;
  guestId: number;
  variant: "same" | "other";
  version: 1 | 2;
};

function verifyToken(token: string): Decoded | null {
  const secret = process.env.EXTENSION_SECRET || "";
  if (!secret) {
    console.error("EXTENSION_SECRET env var not set — extension links disabled");
    return null;
  }

  const parts = token.split(".");

  // v2 token: v2.{res}.{guest}.{variant}.{exp}.{sig}
  if (parts.length === 6 && parts[0] === "v2") {
    try {
      const resId = parseInt(parts[1], 10);
      const guestId = parseInt(parts[2], 10);
      const variant = parts[3];
      const exp = parseInt(parts[4], 10);
      const sig = parts[5];
      if (!Number.isInteger(resId) || !Number.isInteger(guestId) || !Number.isInteger(exp)) return null;
      if (variant !== "same" && variant !== "other") return null;
      if (!/^[0-9a-f]{64}$/i.test(sig)) return null;
      if (exp < Math.floor(Date.now() / 1000)) return null;
      const payload = `v2:${resId}:${guestId}:${variant}:${exp}`;
      const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
      if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
      return { reservationId: resId, guestId, variant, version: 2 };
    } catch {
      return null;
    }
  }

  // Legacy {res}.{guest}.{sig} tokens decode as variant='same' with no expiry
  if (parts.length === 3) {
    try {
      const resId = parseInt(parts[0], 10);
      const guestId = parseInt(parts[1], 10);
      const sig = parts[2];
      if (!Number.isInteger(resId) || !Number.isInteger(guestId)) return null;
      if (!/^[0-9a-f]{64}$/i.test(sig)) return null;
      const payload = `${resId}:${guestId}`;
      const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
      if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
      return { reservationId: resId, guestId, variant: "same", version: 1 };
    } catch {
      return null;
    }
  }

  return null;
}

async function fetchExtensionSettings(): Promise<{
  discount_percent: number;
  unit_change_cleaning_fee: number;
}> {
  const dataHubUrl = process.env.DATA_HUB_URL || "";
  const webhookSecret = process.env.WEBHOOK_SECRET || "";
  const fallback = { discount_percent: 10, unit_change_cleaning_fee: 40 };
  if (!dataHubUrl || !webhookSecret) return fallback;
  try {
    const resp = await fetch(`${dataHubUrl}/admin/api/settings/extension`, {
      headers: { Authorization: `Bearer ${webhookSecret}` },
    });
    if (!resp.ok) return fallback;
    const json = await resp.json();
    return {
      discount_percent: Number(json.discount_percent) || fallback.discount_percent,
      unit_change_cleaning_fee: Number(json.unit_change_cleaning_fee) || fallback.unit_change_cleaning_fee,
    };
  } catch {
    return fallback;
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.params?.token as string;
  if (!token) return { notFound: true };

  const decoded = verifyToken(token);
  if (!decoded) return { notFound: true };

  const reservation = await prisma.reservation.findUnique({
    where: { id: decoded.reservationId },
    include: {
      property: { include: { knowledge: true } },
      guest: true,
    },
  });

  if (!reservation || !reservation.property || !reservation.check_out) {
    return { notFound: true };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkout = new Date(reservation.check_out);
  checkout.setHours(0, 0, 0, 0);
  if (checkout < today) return { notFound: true };

  const hostawayListingId = reservation.property.hostaway_property_id || "";
  const checkoutStr = checkout.toISOString().split("T")[0];
  const calendarEnd = new Date(checkout);
  calendarEnd.setDate(calendarEnd.getDate() + 14);

  const calendarRows = await prisma.calendarDay.findMany({
    where: { hostaway_listing_id: hostawayListingId, date: { gte: checkout, lte: calendarEnd } },
    orderBy: { date: "asc" },
  });

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

  let propertyImage = "";
  try {
    const images = reservation.property.listing_images
      ? JSON.parse(reservation.property.listing_images)
      : [];
    propertyImage = images[0] || "";
  } catch {
    propertyImage = "";
  }

  const settings = await fetchExtensionSettings();

  // For variant=other: query all vacant Pensacola units for the +1 night window.
  // Assertion: guest's own reservation must be Pensacola — otherwise the SMS
  // code path should never have sent an "other" token in the first place.
  let vacantUnits: VacantUnit[] = [];
  if (decoded.variant === "other") {
    const isPensacola = (reservation.property.city || "").trim().toLowerCase() === "pensacola";
    if (!isPensacola) return { notFound: true };

    const windowStart = checkout;
    const windowEnd = new Date(checkout);
    windowEnd.setDate(windowEnd.getDate() + 1);

    const availability = await prisma.$queryRaw<Array<{
      id: number; name: string; hostaway_property_id: string | null; avg_price: number | null;
    }>>`
      WITH win AS (
        SELECT hc.hostaway_listing_id,
               COUNT(*) FILTER (WHERE hc.is_available = 1) AS available_days,
               COUNT(*)                                   AS total_days,
               AVG(hc.price) FILTER (WHERE hc.price IS NOT NULL AND hc.is_available = 1) AS avg_price
        FROM hostaway_calendar hc
        WHERE hc.date >= ${windowStart} AND hc.date < ${windowEnd}
        GROUP BY hc.hostaway_listing_id
      )
      SELECT p.id, p.name, p.hostaway_property_id, win.avg_price
      FROM properties p
      JOIN win ON win.hostaway_listing_id = p.hostaway_property_id
      WHERE win.total_days = 1 AND win.available_days = 1
        AND LOWER(TRIM(COALESCE(p.city,''))) = 'pensacola'
        AND (p.hostaway_property_id <> ${hostawayListingId} OR p.hostaway_property_id IS NULL)
      ORDER BY p.name
    `;

    vacantUnits = availability.map((r) => ({
      propertyId: r.id,
      name: r.name,
      hostawayListingId: r.hostaway_property_id || "",
      nightlyPrice: Number(r.avg_price) || reservation.property!.base_price || 65,
    }));
  }

  return {
    props: {
      variant: decoded.variant,
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
      vacantUnits,
      discountPercent: settings.discount_percent,
      unitChangeCleaningFee: settings.unit_change_cleaning_fee,
      token,
    },
  };
};
