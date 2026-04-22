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
  calendar: CalendarDay[];
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
  vacantUnits: VacantUnit[];
  discountPercent: number;
  unitChangeCleaningFee: number;
  token: string;
};

export default function ExtendStay(props: Props) {
  return <ExtendStayCombined {...props} />;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function ExtendCalendar({
  currentCheckout,
  availableDates,
  basePrice,
  selectedDate,
  onSelect,
  viewMonth,
  viewYear,
  setViewMonth,
  setViewYear,
}: {
  currentCheckout: string;
  availableDates: CalendarDay[];
  basePrice: number;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  viewMonth: number;
  viewYear: number;
  setViewMonth: (m: number) => void;
  setViewYear: (y: number) => void;
}) {
  const availableSet = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of availableDates) map[d.date] = d.price || basePrice;
    return map;
  }, [availableDates, basePrice]);

  const firstAvailableAnchor = useMemo(() => {
    const first = availableDates[0];
    return first
      ? new Date(first.date + "T12:00:00")
      : new Date(currentCheckout + "T12:00:00");
  }, [availableDates, currentCheckout]);

  const startMonth = firstAvailableAnchor.getMonth();
  const startYear = firstAvailableAnchor.getFullYear();

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const canGoPrev = viewYear > startYear || (viewYear === startYear && viewMonth > startMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const cells: Array<null | { day: number; dateStr: string; price: number | null; selectable: boolean }> = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const price = availableSet[dateStr] ?? null;
    cells.push({ day: d, dateStr, price, selectable: price !== null });
  }

  return (
    <div className="bg-white border border-sand-200 rounded-2xl p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} disabled={!canGoPrev}
          className="p-2 rounded-lg hover:bg-sand-100 disabled:opacity-30 disabled:cursor-default transition-colors">
          <svg className="w-4 h-4 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-ocean-700">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-sand-100 transition-colors">
          <svg className="w-4 h-4 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] text-sand-400 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />;
          const { day, dateStr, price, selectable } = cell;
          const isSelected = selectedDate === dateStr;
          return (
            <button key={dateStr} disabled={!selectable} onClick={() => selectable && onSelect(dateStr)}
              className={`flex flex-col items-center justify-center rounded-xl py-2 transition-all ${
                isSelected
                  ? "bg-ocean-500 text-white"
                  : selectable
                  ? "hover:bg-ocean-50 text-ocean-700 cursor-pointer"
                  : "text-sand-300 cursor-default"
              }`}
            >
              <span className={`text-sm font-medium leading-tight ${isSelected ? "text-white" : ""}`}>{day}</span>
              {selectable && (
                <span className={`text-[10px] leading-tight mt-0.5 ${isSelected ? "text-ocean-100" : "text-sand-400"}`}>
                  ${Math.round(price!)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExtendStayCombined({
  propertyName,
  propertyImage,
  currentCheckout,
  guestFirstName,
  guests,
  originalReservationId,
  calendar,
  basePrice,
  discountPercent,
  unitChangeCleaningFee,
  vacantUnits,
  token,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedOtherDate, setSelectedOtherDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentCheckoutFormatted = new Date(currentCheckout + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  // Same-unit: consecutive available nights from current checkout
  const availableDates = useMemo(() => {
    const dates: CalendarDay[] = [];
    for (const day of calendar) {
      if (!day.available) break;
      dates.push(day);
    }
    return dates;
  }, [calendar]);

  const firstAvailDate = availableDates[0]?.date ?? currentCheckout;
  const firstAvailAnchor = new Date(firstAvailDate + "T12:00:00");
  const [viewMonth, setViewMonth] = useState(firstAvailAnchor.getMonth());
  const [viewYear, setViewYear] = useState(firstAvailAnchor.getFullYear());

  // Other-unit calendar navigation state (reset when a new unit is picked)
  const [otherViewMonth, setOtherViewMonth] = useState(firstAvailAnchor.getMonth());
  const [otherViewYear, setOtherViewYear] = useState(firstAvailAnchor.getFullYear());

  const selectedUnit = vacantUnits.find((u) => u.propertyId === selectedUnitId) ?? null;

  // Consecutive available nights for the selected other unit
  const otherAvailableDates = useMemo(() => {
    if (!selectedUnit) return [];
    const dates: CalendarDay[] = [];
    for (const day of selectedUnit.calendar) {
      if (!day.available) break;
      dates.push(day);
    }
    return dates;
  }, [selectedUnit]);

  // Picking a date clears unit selection and vice versa
  function pickDate(date: string) {
    setSelectedDate(date);
    setSelectedUnitId(null);
    setSelectedOtherDate(null);
  }

  function pickUnit(id: number) {
    const unit = vacantUnits.find((u) => u.propertyId === id);
    setSelectedUnitId(id);
    setSelectedDate(null);
    setSelectedOtherDate(null);
    if (unit && unit.calendar.length > 0) {
      const first = unit.calendar[0];
      const anchor = new Date(first.date + "T12:00:00");
      setOtherViewMonth(anchor.getMonth());
      setOtherViewYear(anchor.getFullYear());
    }
  }

  const samePricing = useMemo(() => {
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

  const otherPricing = useMemo(() => {
    if (!selectedUnit || !selectedOtherDate) return null;
    let subtotal = 0;
    let nights = 0;
    for (const day of otherAvailableDates) {
      nights++;
      subtotal += day.price || selectedUnit.nightlyPrice;
      if (day.date === selectedOtherDate) break;
    }
    if (nights === 0) return null;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    return {
      nights,
      subtotal,
      discount: discountAmount,
      cleaningFee: unitChangeCleaningFee,
      total: subtotal - discountAmount + unitChangeCleaningFee,
      perNight: nights > 0 ? Math.round(subtotal / nights) : 0,
    };
  }, [selectedUnit, selectedOtherDate, otherAvailableDates, discountPercent, unitChangeCleaningFee]);

  const canSubmit = (!!selectedDate && !!samePricing) || (!!selectedUnit && !!selectedOtherDate && !!otherPricing);
  const totalToPay = selectedDate ? (samePricing?.total ?? 0) : (otherPricing?.total ?? 0);

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const body = selectedDate
        ? { token, checkIn: currentCheckout, checkOut: selectedDate, guests, originalReservationId, variant: "same" }
        : { token, propertyId: selectedUnit!.propertyId, checkIn: currentCheckout, checkOut: selectedOtherDate!, guests, originalReservationId, variant: "other" };

      const resp = await fetch("/api/extension-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    <Layout title={`Extend Your Stay — ${propertyName}`} description="Extend your stay or move to another unit.">
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
            <p className="text-sm text-ocean-500">Original booking ends</p>
            <p className="font-semibold text-ocean-900">{currentCheckoutFormatted}</p>
          </div>
        </div>

        {/* Same-unit section */}
        {availableDates.length > 0 ? (
          <div className="mb-6">
            <h2 className="font-display text-lg text-ocean-900 mb-1">Stay in {propertyName}</h2>
            <p className="text-sm text-sand-400 mb-3">No cleaning fee — you&apos;re already here</p>
            <ExtendCalendar
              currentCheckout={currentCheckout}
              availableDates={availableDates}
              basePrice={basePrice}
              selectedDate={selectedDate}
              onSelect={pickDate}
              viewMonth={viewMonth}
              viewYear={viewYear}
              setViewMonth={setViewMonth}
              setViewYear={setViewYear}
            />
            {samePricing && selectedDate && (
              <div className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-ocean-600">${samePricing.perNight} × {samePricing.nights} night{samePricing.nights > 1 ? "s" : ""}</span>
                  <span className="text-ocean-900">${samePricing.subtotal}</span>
                </div>
                {discountPercent > 0 && samePricing.discount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-evergreen-700">Extension discount ({discountPercent}%)</span>
                    <span className="text-evergreen-600 font-semibold">−${samePricing.discount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-ocean-600">Cleaning fee</span>
                  <span className="text-evergreen-600 font-semibold">Waived</span>
                </div>
                <div className="border-t border-sand-200 pt-3 flex justify-between items-center">
                  <span className="text-ocean-900 font-bold">Total</span>
                  <span className="text-ocean-900 font-bold text-xl">${samePricing.total}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-coral-700 font-medium">No more nights available in this unit</p>
            <p className="text-coral-500 text-sm mt-1">Another guest is checking in — see other units below.</p>
          </div>
        )}

        {/* Other units section */}
        {vacantUnits.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display text-lg text-ocean-900 mb-1">Or move to another unit</h2>
            <p className="text-sm text-sand-400 mb-3">{discountPercent}% off · ${unitChangeCleaningFee} cleaning fee</p>
            <div className="space-y-2 mb-4">
              {vacantUnits.map((unit) => {
                const isSelected = selectedUnitId === unit.propertyId;
                const discounted = Math.round(unit.nightlyPrice * (1 - discountPercent / 100));
                return (
                  <button
                    key={unit.propertyId}
                    onClick={() => pickUnit(unit.propertyId)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected ? "border-ocean-500 bg-ocean-50 shadow-sm" : "border-sand-200 bg-white hover:border-ocean-300"
                    }`}
                  >
                    <p className={`font-semibold ${isSelected ? "text-ocean-900" : "text-ocean-800"}`}>{unit.name}</p>
                    <p className="text-ocean-500 text-sm mt-0.5">
                      <span className="line-through text-sand-400 mr-2">${Math.round(unit.nightlyPrice)}/nt</span>
                      <span className="text-evergreen-600 font-semibold">${discounted}/nt</span>
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Calendar for selected other unit */}
            {selectedUnit && (
              <div className="mt-1">
                {otherAvailableDates.length > 0 ? (
                  <>
                    <p className="text-sm text-ocean-600 font-medium mb-2">Pick your new checkout date</p>
                    <ExtendCalendar
                      currentCheckout={currentCheckout}
                      availableDates={otherAvailableDates}
                      basePrice={selectedUnit.nightlyPrice}
                      selectedDate={selectedOtherDate}
                      onSelect={setSelectedOtherDate}
                      viewMonth={otherViewMonth}
                      viewYear={otherViewYear}
                      setViewMonth={setOtherViewMonth}
                      setViewYear={setOtherViewYear}
                    />
                  </>
                ) : (
                  <p className="text-sm text-sand-400 mb-4">Only 1 night available in this unit.</p>
                )}

                {otherPricing && selectedOtherDate && (
                  <div className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-ocean-600">${otherPricing.perNight} × {otherPricing.nights} night{otherPricing.nights > 1 ? "s" : ""} — {selectedUnit.name}</span>
                      <span className="text-ocean-900">${otherPricing.subtotal}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-evergreen-700">Extension discount ({discountPercent}%)</span>
                        <span className="text-evergreen-600 font-semibold">−${otherPricing.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-ocean-600">Cleaning fee</span>
                      <span className="text-ocean-900">${otherPricing.cleaningFee}</span>
                    </div>
                    <div className="border-t border-sand-200 pt-3 flex justify-between items-center">
                      <span className="text-ocean-900 font-bold">Total</span>
                      <span className="text-ocean-900 font-bold text-xl">${otherPricing.total}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            canSubmit && !loading
              ? "bg-ocean-800 text-white hover:bg-ocean-900 shadow-md hover:shadow-lg"
              : "bg-sand-200 text-sand-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Processing..." : canSubmit ? `Pay $${totalToPay} & Extend` : "Select a checkout date"}
        </button>

        <p className="text-center text-ocean-400 text-xs mt-4 leading-relaxed">
          {selectedUnit
            ? "Switching units — a new door code will be texted to you."
            : "No extra cleaning fee since you're already here. Your door code stays the same."}
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
      if (!crypto.timingSafeEqual(new Uint8Array(Buffer.from(sig, "hex")), new Uint8Array(Buffer.from(expected, "hex")))) return null;
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
      if (!crypto.timingSafeEqual(new Uint8Array(Buffer.from(sig, "hex")), new Uint8Array(Buffer.from(expected, "hex")))) return null;
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
  const fallback = { discount_percent: 5, unit_change_cleaning_fee: 40 };
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
      property: { include: { knowledge: true, websiteOverride: true } },
      guest: true,
    },
  });

  if (!reservation || !reservation.property || !reservation.check_out) {
    return { notFound: true };
  }

  const DEAD_STATUSES = new Set(["cancelled", "canceled", "declined", "inquiry", "expired"]);
  if (reservation.status && DEAD_STATUSES.has(reservation.status.toLowerCase())) {
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
  calendarEnd.setDate(calendarEnd.getDate() + 30);

  const calendarRows = await prisma.calendarDay.findMany({
    where: { hostaway_listing_id: hostawayListingId, date: { gte: checkout, lte: calendarEnd } },
    orderBy: { date: "asc" },
  });

  const calendar: CalendarDay[] = calendarRows
    .filter((d) => {
      if (!d.date) return false;
      const dStr = d.date.toISOString().split("T")[0];
      return dStr > checkoutStr;
    })
    .map((d) => ({
      date: d.date!.toISOString().split("T")[0],
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

  let vacantUnits: VacantUnit[] = [];
  const isPensacola = (reservation.property.city || "").trim().toLowerCase() === "pensacola";
  if (isPensacola) {
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

    const propIds = availability.map((r) => r.id);
    const overrides = propIds.length > 0
      ? await prisma.websitePropertyOverride.findMany({
          where: { property_id: { in: propIds } },
          select: { property_id: true, website_name: true },
        })
      : [];
    const overrideMap = Object.fromEntries(overrides.map((o) => [o.property_id, o.website_name]));

    // Fetch 14-day calendar for each vacant unit so guest can pick multi-night checkout
    const vacantCalendarsRaw = await Promise.all(
      availability.map((r) =>
        prisma.calendarDay.findMany({
          where: {
            hostaway_listing_id: r.hostaway_property_id || "",
            date: { gte: checkout, lte: calendarEnd },
          },
          orderBy: { date: "asc" },
        })
      )
    );

    vacantUnits = availability.map((r, i) => {
      const calRows = vacantCalendarsRaw[i];
      const unitCal: CalendarDay[] = calRows
        .filter((d) => {
          if (!d.date) return false;
          return d.date.toISOString().split("T")[0] > checkoutStr;
        })
        .map((d) => ({
          date: d.date!.toISOString().split("T")[0],
          price: d.price || reservation.property!.base_price || 65,
          available: d.is_available === 1,
        }));

      return {
        propertyId: r.id,
        name: overrideMap[r.id] || r.name,
        hostawayListingId: r.hostaway_property_id || "",
        nightlyPrice: Number(r.avg_price) || reservation.property!.base_price || 65,
        calendar: unitCal,
      };
    });
  }

  return {
    props: {
      variant: decoded.variant,
      propertyId: reservation.property.id,
      propertyName: reservation.property.websiteOverride?.website_name || reservation.property.name,
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
